'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingScreen from '@/components/loading-screen'

export default function UpgradeSuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        if (!sessionId) {
          router.push('/')
          return
        }

        const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
        if (!response.ok) {
          console.error('Failed to verify session')
        }
        
        // Redirect to homepage regardless of verification result
        router.push('/')
      } catch (err) {
        console.error('Error:', err)
        router.push('/')
      }
    }

    verifyAndRedirect()
  }, [sessionId, router])

  return <LoadingScreen />
} 