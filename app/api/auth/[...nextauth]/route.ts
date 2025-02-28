import { NextResponse } from 'next/server';

// Define the redirect URL using environment variables
const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

// Export a GET handler (required for Next.js API routes)
export async function GET(request: Request) {
  // You can use the redirectUrl variable here
  return NextResponse.json({ 
    message: 'Auth route is working',
    redirectUrl 
  });
}

// If you need other HTTP methods, export them as well
export async function POST(request: Request) {
  // Handle POST requests
  return NextResponse.json({ 
    message: 'Auth POST route is working',
    redirectUrl 
  });
} 