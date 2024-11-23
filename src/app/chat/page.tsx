import { Suspense } from 'react'
import ChatPageClient from './client-component'
import LoadingScreen from '@/components/loading-screen'

export default function ChatPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <ChatPageClient />
      </Suspense>
    </main>
  )
} 