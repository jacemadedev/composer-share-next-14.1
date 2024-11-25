import { Suspense } from 'react'
import HomePage from '@/components/home-page'
import LoadingScreen from '@/components/loading-screen'

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <HomePage />
    </Suspense>
  )
} 