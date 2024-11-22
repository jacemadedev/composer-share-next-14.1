'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function UpgradeSuccessClient() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (!sessionId) {
          throw new Error('Invalid session')
        }
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
        if (!response.ok) {
          throw new Error('Failed to verify session')
        }
        // Handle successful verification (e.g., update UI, store in local storage, etc.)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify your subscription. Please contact support.')
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      verifySession()
    } else {
      setIsLoading(false)
    }
  }, [sessionId])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">Thank You for Upgrading!</h1>
        <p className="text-xl mb-6">Your account has been successfully upgraded to Premium.</p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

