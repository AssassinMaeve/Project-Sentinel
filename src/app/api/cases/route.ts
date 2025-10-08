import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

const DB_NAME = "sentineldb";
const CASES_COLLECTION = "cases";

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

// GET - Fetch all cases for logged-in user
export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const casesCollection = db.collection(CASES_COLLECTION);

    const cases = await casesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ cases }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ message: "Failed to fetch cases" }, { status: 500 });
  }
}

// POST - Create new case/deadline
export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { caseName, caseNumber, description, deadline, type } = await request.json();

    if (!caseName || !deadline) {
      return NextResponse.json({ message: "Case name and deadline are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const casesCollection = db.collection(CASES_COLLECTION);

    const newCase = {
      userId,
      caseName,
      caseNumber: caseNumber || `CZ-${Date.now()}`,
      description: description || '',
      deadline: new Date(deadline),
      type: type || 'Incident Report',
      status: 'Active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await casesCollection.insertOne(newCase);

    return NextResponse.json({ 
      message: "Case created successfully",
      caseId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json({ message: "Failed to create case" }, { status: 500 });
  }
}

// DELETE - Delete case
export async function DELETE(request: Request) {
  try {
    const userId = await getUserIdFromToken();
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const casesCollection = db.collection(CASES_COLLECTION);

    const result = await casesCollection.deleteOne({
      _id: new ObjectId(caseId),
      userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Case deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json({ message: "Failed to delete case" }, { status: 500 });
  }
}
