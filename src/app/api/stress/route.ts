import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';
import * as jose from 'jose';
import { cookies } from 'next/headers';

const DB_NAME = "sentineldb";
const STRESS_COLLECTION = "stress_logs";

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

// POST - Log stress check-in
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle both old format (answers array) and new format (checkInData object)
    let stressScore: number;
    let recommendations: string[];
    
    if (body.checkInData) {
      // New format from wellness check-in
      const { checkInData, deadlines } = body;
      stressScore = calculateStressFromCheckIn(checkInData);
      recommendations = generateDetailedRecommendations(checkInData, deadlines || 0);
      
      // Try to save to database if user is authenticated
      const userId = await getUserIdFromToken();
      if (userId) {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const stressCollection = db.collection(STRESS_COLLECTION);

        await stressCollection.insertOne({
          userId,
          stressScore,
          checkInData,
          timestamp: new Date(),
        });
      }
    } else if (body.answers) {
      // Old format from direct stress check
      const userId = await getUserIdFromToken();
      if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { answers } = body;
      stressScore = Math.round(
        answers.reduce((sum: number, val: number) => sum + val, 0) / answers.length * 10
      );

      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const stressCollection = db.collection(STRESS_COLLECTION);

      await stressCollection.insertOne({
        userId,
        stressScore,
        answers,
        timestamp: new Date(),
      });

      recommendations = getRecommendations(stressScore);
    } else {
      return NextResponse.json({ 
        message: "Invalid request format" 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      stressScore,
      level: getStressLevel(stressScore),
      recommendations
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error logging stress:", error);
    return NextResponse.json({ 
      message: "Failed to log stress" 
    }, { status: 500 });
  }
}

// GET - Get latest stress data
export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) {
      return NextResponse.json({ stressScore: null }, { status: 200 });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const stressCollection = db.collection(STRESS_COLLECTION);

    const latestLog = await stressCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (latestLog.length === 0) {
      return NextResponse.json({ stressScore: null }, { status: 200 });
    }

    const stressScore = latestLog[0].stressScore;

    return NextResponse.json({ 
      stressScore,
      level: getStressLevel(stressScore),
      recommendations: getRecommendations(stressScore),
      lastCheckin: latestLog[0].timestamp
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching stress:", error);
    return NextResponse.json({ 
      message: "Failed to fetch stress" 
    }, { status: 500 });
  }
}

// NEW: Calculate stress score from check-in data
function calculateStressFromCheckIn(checkInData: any): number {
  let score = 50; // Base score

  // Sleep quality impact (0-20 points)
  if (checkInData.sleepQuality) {
    score += (checkInData.sleepQuality - 3) * 5;
  }

  // Energy level impact
  if (checkInData.physicalEnergy === 'high') score += 10;
  else if (checkInData.physicalEnergy === 'low') score -= 10;

  // Mental readiness impact
  if (checkInData.mentalReadiness === 'fully') score += 15;
  else if (checkInData.mentalReadiness === 'not-ready') score -= 15;

  // Stress response impact
  if (checkInData.stressResponse) {
    score -= (checkInData.stressResponse - 3) * 8;
  }

  // Incident exposure impact
  const incidentImpact: any = {
    'none': 5,
    'minor': 0,
    'moderate': -10,
    'severe': -20
  };
  if (checkInData.incidentExposure) {
    score += incidentImpact[checkInData.incidentExposure] || 0;
  }

  // Support needs bonus
  if (checkInData.supportNeeds?.length > 0) {
    score += checkInData.supportNeeds.length * 3;
  }

  // Emotional state impact
  if (checkInData.emotionalState?.includes('Anxious')) score -= 5;
  if (checkInData.emotionalState?.includes('Overwhelmed')) score -= 8;
  if (checkInData.emotionalState?.includes('Frustrated')) score -= 5;
  if (checkInData.emotionalState?.includes('Calm')) score += 5;
  if (checkInData.emotionalState?.includes('Motivated')) score += 5;
  if (checkInData.emotionalState?.includes('Confident')) score += 5;

  return Math.max(0, Math.min(100, score));
}

// NEW: Generate detailed recommendations based on check-in data
function generateDetailedRecommendations(checkInData: any, deadlineCount: number): string[] {
  const recommendations: string[] = [];

  // Sleep-based recommendations
  if (checkInData.sleepQuality <= 2) {
    recommendations.push('🌙 Your sleep quality is low. Try avoiding screens 1 hour before bed and maintain a consistent sleep schedule.');
  } else if (checkInData.sleepQuality >= 4) {
    recommendations.push('✨ Great sleep quality! Keep up your healthy sleep routine.');
  }

  // Energy-based recommendations
  if (checkInData.physicalEnergy === 'low') {
    recommendations.push('⚡ Low energy detected. Consider a 15-minute power nap or a brisk 5-minute walk.');
  } else if (checkInData.physicalEnergy === 'high') {
    recommendations.push('💪 Excellent energy levels! This is a great time for focused work.');
  }

  // Mental readiness recommendations
  if (checkInData.mentalReadiness === 'not-ready') {
    recommendations.push('🧠 Take 5 minutes for grounding exercises: deep breathing or brief meditation before your shift.');
  } else if (checkInData.mentalReadiness === 'fully') {
    recommendations.push('🎯 You\'re mentally prepared! Maintain this readiness with regular breaks.');
  }

  // Emotional state recommendations
  if (checkInData.emotionalState?.includes('Anxious')) {
    recommendations.push('😌 Anxiety detected. Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s.');
  }
  if (checkInData.emotionalState?.includes('Overwhelmed')) {
    recommendations.push('🛑 Feeling overwhelmed? Break tasks into smaller steps and prioritize the most urgent ones.');
  }
  if (checkInData.emotionalState?.includes('Motivated')) {
    recommendations.push('🚀 Great motivation! Channel this energy into your priority tasks today.');
  }

  // Stress response recommendations
  if (checkInData.stressResponse >= 4) {
    recommendations.push('⚠️ High stress levels detected. Schedule time with a peer support officer or use the AI Therapy Assistant today.');
  }

  // Incident exposure recommendations
  if (checkInData.incidentExposure === 'severe') {
    recommendations.push('🆘 Severe incident exposure requires attention. Please reach out to your wellness coordinator or call Cop2Cop: 1-866-267-2267');
  } else if (checkInData.incidentExposure === 'moderate') {
    recommendations.push('🔔 Moderate stress incident detected. Consider debriefing with a trusted colleague or supervisor.');
  }

  // Deadline pressure
  if (deadlineCount >= 3) {
    recommendations.push('📅 You have multiple upcoming deadlines. Prioritize tasks and delegate when possible.');
  }

  // Support needs acknowledgment
  if (checkInData.supportNeeds?.length > 0) {
    recommendations.push(`✅ Good job identifying your support needs: ${checkInData.supportNeeds.join(', ')}. Make time for these activities today.`);
  }

  // Default positive message if no critical issues
  if (recommendations.length === 0) {
    recommendations.push('✨ Your wellness indicators look good! Continue your healthy habits and stay proactive about self-care.');
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

function getStressLevel(score: number) {
  if (score < 30) return { label: "Low", color: "green", emoji: "😊" };
  if (score < 60) return { label: "Moderate", color: "yellow", emoji: "😐" };
  if (score < 80) return { label: "High", color: "orange", emoji: "😰" };
  return { label: "Critical", color: "red", emoji: "😫" };
}

function getRecommendations(score: number) {
  if (score < 30) {
    return [
      "Great job managing stress! Keep up your wellness routine.",
      "Take a 20-minute walk to maintain your wellbeing.",
      "Connect with a colleague for positive conversation."
    ];
  } else if (score < 60) {
    return [
      "Try the 4-7-8 breathing technique (Inhale 4s, Hold 7s, Exhale 8s).",
      "Take a 10-minute break from work tasks.",
      "Listen to calming music or nature sounds."
    ];
  } else if (score < 80) {
    return [
      "⚠️ Take immediate action: Do 5 minutes of deep breathing NOW.",
      "Talk to a peer support officer or trusted colleague.",
      "Consider taking a short walk or stretching for 10 minutes.",
      "Schedule a counseling session if stress persists."
    ];
  } else {
    return [
      "🚨 URGENT: Your stress is at critical levels.",
      "Contact your department wellness coordinator immediately.",
      "Take a break from work if possible.",
      "Call crisis support: Cop2Cop 1-866-267-2267",
      "Open AI Therapy Assistant for immediate support."
    ];
  }
}
