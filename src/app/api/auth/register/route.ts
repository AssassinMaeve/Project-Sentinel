import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';

const DB_NAME = "sentineldb";
const COLLECTION_NAME = "users";

export async function POST(request: Request) {
  const { fullName, badgeNumber, email, password } = await request.json();

  if (!fullName || !badgeNumber || !email || !password) {
    return NextResponse.json({ message: "All fields are required." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ $or: [{ email }, { badgeNumber }] });
    if (existingUser) {
      return NextResponse.json({ message: "User with this email or badge number already exists." }, { status: 409 });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await usersCollection.insertOne({
      fullName,
      badgeNumber,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}