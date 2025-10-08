import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const DB_NAME = "sentineldb";
const USERS_COLLECTION = "users";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-super-secret-key-that-is-at-least-32-chars-long'
);

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session');
  
  if (!sessionToken) return null;

  try {
    const { payload } = await jose.jwtVerify(sessionToken.value, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

// GET - Fetch user profile
export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const user = await usersCollection.findOne(
      { _id: new (require('mongodb')).ObjectId(userId) },
      { projection: { passwordHash: 0 } } // Exclude password
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name || user.fullName,
      email: user.email,
      badgeNumber: user.badgeNumber,
      department: user.department,
      rank: user.rank,
      joinDate: user.joinDate || user.createdAt
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ 
      message: "Failed to fetch profile" 
    }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, badgeNumber, department, rank, joinDate } = body;

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new (require('mongodb')).ObjectId(userId) },
      {
        $set: {
          name,
          fullName: name, // Keep both for compatibility
          email,
          badgeNumber,
          department,
          rank,
          joinDate,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: { name, email, badgeNumber, department, rank, joinDate }
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ 
      message: "Failed to update profile" 
    }, { status: 500 });
  }
}
