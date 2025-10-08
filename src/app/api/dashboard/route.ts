import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

const DB_NAME = "sentineldb";
const CASES_COLLECTION = "cases";
const USERS_COLLECTION = "users";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-super-secret-key-that-is-at-least-32-chars-long'
);

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session');
  
  if (!sessionToken) {
    return null;
  }

  try {
    const { payload } = await jose.jwtVerify(sessionToken.value, JWT_SECRET);
    return payload.userId as string;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Get user info
    const usersCollection = db.collection(USERS_COLLECTION);
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    // Get all active cases
    const casesCollection = db.collection(CASES_COLLECTION);
    const allCases = await casesCollection
      .find({ userId, status: 'Active' })
      .sort({ deadline: 1 })
      .toArray();

    // Calculate deadlines that are due within 2 days
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);

    const upcomingDeadlines = allCases
      .filter(caseItem => {
        const deadline = new Date(caseItem.deadline);
        return deadline >= now && deadline <= twoDaysFromNow;
      })
      .map(caseItem => {
        const deadline = new Date(caseItem.deadline);
        const hoursUntil = Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        let timeUntil;
        if (hoursUntil < 24) {
          timeUntil = `Due in ${hoursUntil} hours`;
        } else {
          const daysUntil = Math.floor(hoursUntil / 24);
          timeUntil = `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
        }

        return {
          id: caseItem._id.toString(),
          caseNumber: caseItem.caseNumber,
          type: caseItem.type,
          timeUntil,
          deadline: caseItem.deadline
        };
      });

    // Format active cases for display
    const activeCases = allCases.map(caseItem => ({
      id: caseItem._id.toString(),
      caseNumber: caseItem.caseNumber,
      caseName: caseItem.caseName,
      description: caseItem.description,
      status: caseItem.status,
      deadline: caseItem.deadline
    }));

    return NextResponse.json({
      user: {
        name: user?.name || 'Officer',
        email: user?.email,
        badgeNumber: user?.badgeNumber
      },
      deadlines: upcomingDeadlines,
      cases: activeCases
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ message: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
