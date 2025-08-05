// Example Google OAuth2 API route for App Router
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Google OAuth2 API route working!' });
}
