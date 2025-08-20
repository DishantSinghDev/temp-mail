// /app/api/mailbox/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { fetchFromServiceAPI } from '@/lib/api'
import { authOptions } from '../auth/[...nextauth]/route'
import jwt from "jsonwebtoken";
import { verify } from '@/lib/jwt'; // <-- Import your custom verify function
import { headers } from 'next/headers'; // <-- Import headers to read Authorization
import { rateLimiter } from '@/lib/rate-limiter';

// Define the shape of your NextAuth session
interface UserSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    plan?: string | null // Assuming plan is part of the user object in the session
  }
  accessToken?: string
}

async function handleAuthentication() {
  const authHeader = (await headers()).get('Authorization');
  let tokenData: { plan: string } | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // 2. Fallback to Bearer token authentication
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const payload = await verify(token);
    if (payload) {
      tokenData = { plan: "" }; // Assume the plan is in the custom JWT payload
    } else {
      // If token is present but invalid, deny access
      return { error: 'Invalid token', status: 401 };
    }
  } else {
    return { error: 'Authentication required', status: 401 };
  }

  const session: UserSession | null = await getServerSession(authOptions);
  if (session?.user) {
    tokenData = { plan: session.user.plan || "" };
  }

  if (!tokenData) {
    // If no authentication method succeeded
    return { error: 'Authentication required', status: 401 };
  }

  // 3. Sign a new short-lived token with the plan for the backend service
  const signedToken = jwt.sign(
    { plan: tokenData.plan },
    process.env.NEXTAUTH_SECRET as string,
    { algorithm: "HS256", expiresIn: "15m" }
  );

  return { signedToken };
}

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimiter();
  if (rateLimitResponse) return rateLimitResponse;

  const authResult = await handleAuthentication();
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { signedToken } = authResult;

  const { searchParams } = new URL(request.url)
  const mailbox = searchParams.get('fullMailboxId')
  const messageId = searchParams.get('messageId')

  if (!mailbox) {
    return NextResponse.json({ error: 'Mailbox parameter is required' }, { status: 400 })
  }

  try {
    const options = {
      headers: {
        'Authorization': `Bearer ${signedToken}`
      }
    };

    let data;
    if (messageId) {
      // Fetch a single message
      data = await fetchFromServiceAPI(`/mailbox/${mailbox}/message/${messageId}`, options);
    } else {
      // Fetch the list of messages
      data = await fetchFromServiceAPI(`/mailbox/${mailbox}`, options);
    }
    return NextResponse.json(data);

  } catch (error) {
    console.error('API request failed:', error);
    return NextResponse.json({ error: 'Failed to fetch data from the service API' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const rateLimitResponse = await rateLimiter();
  if (rateLimitResponse) return rateLimitResponse;


  const authResult = await handleAuthentication();
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
  }

  const { signedToken } = authResult;

  const { searchParams } = new URL(request.url)
  const mailbox = searchParams.get('fullMailboxId')
  const messageId = searchParams.get('messageId')

  if (!mailbox || !messageId) {
    return NextResponse.json({ error: 'Mailbox and messageId parameters are required' }, { status: 400 })
  }

  try {
    const data = await fetchFromServiceAPI(`/mailbox/${mailbox}/message/${messageId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${signedToken}`
      }
    });
    return NextResponse.json(data);

  } catch (error) {
    console.error('API request failed during DELETE:', error);
    return NextResponse.json({ error: 'Failed to delete the message' }, { status: 500 });
  }
}