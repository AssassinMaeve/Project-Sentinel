// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';

const DB_NAME = "sentineldb";
const COLLECTION_NAME = "users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Accept both 'name' and 'fullName' for flexibility
    const fullName = body.fullName || body.name;
    const { badgeNumber, email, password } = body;

    // Check for required fields
    if (!fullName || !email || !password) {
      return NextResponse.json({ 
        message: "Name, email, and password are required." 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Check if user with same email already exists
    const existingUser = await usersCollection.findOne({ 
      $or: [
        { email },
        ...(badgeNumber ? [{ badgeNumber }] : [])
      ] 
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        message: "User with this email or badge number already exists." 
      }, { status: 409 });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await usersCollection.insertOne({
      name: fullName, // Store as 'name' to match User interface
      fullName, // Also store as fullName for compatibility
      badgeNumber: badgeNumber || null,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ 
      message: "User registered successfully.",
      userId: result.insertedId 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ 
      message: "An internal server error occurred." 
    }, { status: 500 });
  }
}
