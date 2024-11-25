'use client'

import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth-modal'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 md:px-6">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Composers.dev</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="hidden md:inline-flex"
            onClick={() => setShowAuthModal(true)}
          >
            Sign in
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowAuthModal(true)}
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center max-w-5xl mx-auto">
          {/* Product Hunt Badge */}
          <Link 
            href="https://www.producthunt.com"
            className="flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white border hover:bg-gray-50 transition-colors"
          >
            <span>Product Hunt</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              The easiest way to<br />develop in bolt
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              #1 Composers.dev & Cursor Boilerplates
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full md:w-[320px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button 
                size="lg"
                className="w-full md:w-auto"
                onClick={() => setShowAuthModal(true)}
              >
                I want to get it <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 text-sm text-green-500">
              33 people joined today!
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <FeatureCard
              icon="🎨"
              title="Modern UI/UX"
              description="Beautiful, responsive design with Tailwind CSS, dark mode, and Framer Motion animations"
            />
            <FeatureCard
              icon="🔒"
              title="Authentication & Security"
              description="Supabase authentication, protected routes, and type-safe API calls"
            />
            <FeatureCard
              icon="💳"
              title="Payments"
              description="Stripe integration with subscription management and usage-based billing"
            />
            <FeatureCard
              icon="🤖"
              title="AI Integration"
              description="OpenAI API integration with chat interface and token usage tracking"
            />
          </div>

          {/* Tech Stack */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">Modern Tech Stacks</p>
            <div className="flex flex-wrap justify-center gap-6">
              {['Vite', 'Remix', 'Shadcn', 'React', 'Vercel'].map((tech) => (
                <span key={tech} className="text-gray-800">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-white">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
} 