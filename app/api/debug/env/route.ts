import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔍 [DEBUG ENV] Environment variables check')
  
  const envStatus = {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  }
  
  console.log('📊 [DEBUG ENV] Status:', envStatus)
  
  return NextResponse.json(envStatus)
}