import { Metadata } from 'next'
import { Suspense } from 'react'
import UpgradeSuccessClient from './client-component'
import LoadingScreen from '@/components/loading-screen'

export const metadata: Metadata = {
  title: 'Upgrade Success - Composer Kit',
  description: 'Your account has been successfully upgraded to Premium'
}

export default function UpgradeSuccessPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <UpgradeSuccessClient />
      </Suspense>
    </main>
  )
}

