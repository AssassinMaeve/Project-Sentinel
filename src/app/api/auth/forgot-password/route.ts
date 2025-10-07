import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import crypto from 'crypto';
import { Resend } from 'resend'; // ✅ 1. Import Resend

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

const DB_NAME = "sentineldb";
const COLLECTION_NAME = "users";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ message: "Email is required." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { passwordResetToken, passwordResetExpires } }
    );

    const resetURL = `${request.headers.get('origin')}/reset-password?token=${resetToken}`;
    
    // ✅ 2. Replace the console.log with the actual email sending logic
    try {
      await resend.emails.send({
        from: 'Project Sentinel <onboarding@resend.dev>', // Use this for testing
        to: user.email,
        subject: 'Project Sentinel - Password Reset Request',
        html: `<p>Click <a href="${resetURL}">here</a> to reset your password. This link is valid for 10 minutes.</p>`
      });
    } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Don't reveal the error to the user for security reasons
    }

    return NextResponse.json({ message: "If an account with this email exists, a reset link has been sent." }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An internal server error occurred." }, { status: 500 });
  }
}