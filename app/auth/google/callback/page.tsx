'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveGoogleSheetsConfig, autoConnectExistingTracker } from '@/lib/google-sheets'

export default function GoogleCallback() {
  const [status, setStatus] = useState('Processing...')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [DEBUG] OAuth callback started')
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      console.log('📋 [DEBUG] URL params:', { code: !!code, error })

      if (error) {
        console.error('❌ [DEBUG] OAuth error:', error)
        setStatus('Authentication failed: ' + error)
        setTimeout(() => router.push('/settings'), 3000)
        return
      }

      if (!code) {
        console.error('❌ [DEBUG] No authorization code received')
        setStatus('No authorization code received')
        setTimeout(() => router.push('/settings'), 3000)
        return
      }

      try {
        console.log('🔄 [DEBUG] Exchanging code for tokens...')
        // Exchange code for tokens
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        console.log('📊 [DEBUG] Token exchange response status:', response.status)

        if (response.ok) {
          const tokenData = await response.json()
          console.log('✅ [DEBUG] Token exchange successful:', {
            hasAccessToken: !!tokenData.access_token,
            hasRefreshToken: !!tokenData.refresh_token,
            expiresIn: tokenData.expires_in
          })
          
          // Save tokens
          saveGoogleSheetsConfig({
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || '',
            expiresAt: Date.now() + (tokenData.expires_in * 1000)
          })

          console.log('💾 [DEBUG] Tokens saved to localStorage')
          
          // Try to auto-connect to existing expense tracker
          setStatus('Searching for existing expense tracker...')
          const autoConnectResult = await autoConnectExistingTracker()
          
          if (autoConnectResult.ok) {
            console.log('✅ [DEBUG] Auto-connected to existing tracker')
            setStatus('Connected to existing expense tracker! Redirecting...')
          } else {
            console.log('ℹ️ [DEBUG] No existing tracker found, user will need to create/connect one')
            setStatus('Authentication successful! Redirecting...')
          }
          
          setTimeout(() => router.push('/settings'), 2000)
        } else {
          const errorText = await response.text()
          console.error('❌ [DEBUG] Token exchange failed:', response.status, errorText)
          setStatus('Token exchange failed: ' + response.status)
          setTimeout(() => router.push('/settings'), 3000)
        }
      } catch (error) {
        console.error('❌ [DEBUG] Authentication error:', error)
        setStatus('Authentication error: ' + (error as Error).message)
        setTimeout(() => router.push('/settings'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold mb-2">Connecting to Google Sheets</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}