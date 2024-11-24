import { Suspense } from 'react'
import ReviewPageClient from './client-component'
import LoadingScreen from '@/components/loading-screen'

export default function ReviewPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <ReviewPageClient />
      </Suspense>
    </main>
  )
} 