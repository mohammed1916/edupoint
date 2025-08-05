// Example Google API route for App Router
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Google API route working!' });
}
