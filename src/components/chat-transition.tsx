'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ChatTransitionProps {
  query?: string;
}

export default function ChatTransition({ query }: ChatTransitionProps) {
  const [loadingText, setLoadingText] = useState('Creating your chat experience')
  
  // Cycle through different loading messages
  useEffect(() => {
    const messages = [
      'Creating your chat experience',
      'Preparing your workspace',
      'Loading AI assistant',
      query ? `Getting ready to ${query.toLowerCase()}...` : 'Almost there...'
    ]
    
    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length
      setLoadingText(messages[currentIndex])
    }, 2000)

    return () => clearInterval(interval)
  }, [query])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-8">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 animate-pulse">
          {loadingText}
        </h2>
        <p className="text-gray-500 max-w-sm mx-auto">
          We&apos;re setting up a personalized chat session for you. This will only take a moment.
        </p>
      </div>
    </div>
  )
} 