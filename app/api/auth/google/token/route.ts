import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🔄 [DEBUG API] Token exchange endpoint called')
  
  try {
    const { code } = await request.json()
    console.log('📋 [DEBUG API] Received code:', !!code)
    
    if (!code) {
      console.error('❌ [DEBUG API] No authorization code provided')
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/auth/google/callback`

    console.log('🔧 [DEBUG API] Environment check:', {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      redirectUri
    })

    if (!clientId || !clientSecret) {
      console.error('❌ [DEBUG API] Missing Google OAuth configuration')
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Token exchange failed:', error)
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 400 })
    }

    const tokens = await tokenResponse.json()
    
    return NextResponse.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}