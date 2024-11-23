import { Suspense } from 'react'
import HomePage from '@/components/home-page'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  )
}

