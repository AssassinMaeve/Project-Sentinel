import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import bcrypt from 'bcrypt';
import * as jose from 'jose';

const DB_NAME = "sentineldb";
const COLLECTION_NAME = "users";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-super-secret-key-that-is-at-least-32-chars-long'
);

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const usersCollection = db.collection(COLLECTION_NAME);

        const user = await usersCollection.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
        }

        // Create JWT token with 7 days expiry (longer session)
        const token = await new jose.SignJWT({ 
            userId: user._id.toString(), 
            email: user.email 
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d') // Changed from 1h to 7d
            .sign(JWT_SECRET);
        
        // Create the successful response
        const response = NextResponse.json({ message: "Login successful." }, { status: 200 });

        // Set the JWT in a secure, httpOnly cookie with longer maxAge
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax', // Added for better compatibility
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds (changed from 1 hour)
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
    }
}
