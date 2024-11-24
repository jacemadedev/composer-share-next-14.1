import { Suspense } from 'react'
import UpgradeSuccessClient from './client-component'

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpgradeSuccessClient />
    </Suspense>
  )
}

