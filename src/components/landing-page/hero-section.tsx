import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  onAuthClick: () => void;
}

export function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-2 px-4 py-1.5 mb-8">
        <Link 
          href="https://www.producthunt.com"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border hover:bg-gray-50 transition-colors"
        >
          <span>Product Hunt</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
          Beta phase access
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
        The easiest way to<br />develop in bolt
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        #1 Composers.dev & Cursor Boilerplates
      </p>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button 
          size="lg"
          className="w-full md:w-auto whitespace-nowrap"
          onClick={onAuthClick}
        >
          I want to get it <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 text-sm text-green-500 bg-green-50 px-4 py-1 rounded-full">
        33 people joined today!
      </div>
    </div>
  )
} 