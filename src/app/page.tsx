import { Suspense } from 'react'
import HomePage from '@/components/home-page'
import UpgradeSuccess from './upgrade-success/page'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
      <UpgradeSuccess />
    </Suspense>
  )
}

