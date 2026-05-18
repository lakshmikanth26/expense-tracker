'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveGoogleSheetsConfig } from '@/lib/google-sheets'

export default function GoogleCallback() {
  const [status, setStatus] = useState('Processing...')
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('Authentication failed')
        setTimeout(() => router.push('/settings'), 3000)
        return
      }

      if (!code) {
        setStatus('No authorization code received')
        setTimeout(() => router.push('/settings'), 3000)
        return
      }

      try {
        // Exchange code for tokens
        const response = await fetch('/api/auth/google/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        })

        if (response.ok) {
          const { access_token, refresh_token, expires_in } = await response.json()
          
          // Save tokens
          saveGoogleSheetsConfig({
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: Date.now() + (expires_in * 1000)
          })

          setStatus('Authentication successful! Redirecting...')
          setTimeout(() => router.push('/settings'), 2000)
        } else {
          setStatus('Token exchange failed')
          setTimeout(() => router.push('/settings'), 3000)
        }
      } catch (error) {
        setStatus('Authentication error')
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