'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from '@/components/auth-modal'
import { NavBar } from './landing-page/nav-bar'
import { HeroSection } from './landing-page/hero-section'
import { FeatureCard } from './landing-page/feature-card'
import { TechStack } from './landing-page/tech-stack'
import { BentoGridThirdDemo } from '@/components/ui/bento-grid'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Footer } from './landing-page/footer'
import { StarterKits } from './landing-page/starter-kits'

const LEFT_FEATURES = [
  {
    icon: '🎨',
    title: 'Modern Design System',
    description: 'Beautiful, responsive design with Tailwind CSS, dark mode, and Framer Motion animations'
  },
  {
    icon: '🔒',
    title: 'Secure Authentication',
    description: 'Supabase authentication, protected routes, and type-safe API calls'
  },
  {
    icon: '💳',
    title: 'Payment Integration',
    description: 'Stripe integration with subscription management and usage-based billing'
  },
]

const RIGHT_FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Powered Features',
    description: 'OpenAI API integration with chat interface and token usage tracking'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Vite for fast development, optimized builds, and lazy loading'
  },
  {
    icon: '🛠️',
    title: 'Modern Stack',
    description: 'React, TypeScript, Tailwind, shadcn/ui, Supabase, Stripe, and more'
  },
]

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <NavBar onAuthClick={() => setShowAuthModal(true)} />
      
      <div className="container mx-auto py-16">
        {/* Hero Section with Feature Cards */}
        <div className="relative">
          {/* Left Features */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 space-y-6 w-[340px] -left-6 xl:-left-12 2xl:-left-16">
            {LEFT_FEATURES.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>

          {/* Hero Content */}
          <div className="max-w-3xl mx-auto px-4 z-10 relative">
            <HeroSection onAuthClick={() => setShowAuthModal(true)} />
            
            {/* Mobile Features */}
            <div className="lg:hidden mt-12 space-y-6">
              {[...LEFT_FEATURES, ...RIGHT_FEATURES].map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Right Features */}
          <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 space-y-6 w-[340px] -right-6 xl:-right-12 2xl:-right-16">
            {RIGHT_FEATURES.map((feature, index) => (
              <FeatureCard 
                key={index} 
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index + LEFT_FEATURES.length}
              />
            ))}
          </div>
        </div>

        <TechStack />
      </div>

      {/* Bento Grid Section */}
      <div className="bg-gray-50/50">
        <div className="container mx-auto py-24 px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              Pre-built web apps for Bolt.new & Cursor Developers
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Save hours and api credits by starting with a working demo.
            </p>
            <Button 
              size="lg"
              className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={() => setShowAuthModal(true)}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <BentoGridThirdDemo />
        </div>
      </div>

      {/* Pass the auth handler to StarterKits */}
      <StarterKits onAuthClick={() => setShowAuthModal(true)} />

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
} 