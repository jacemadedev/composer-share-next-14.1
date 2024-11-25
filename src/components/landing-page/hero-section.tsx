import { Button } from '@/components/ui/button'
import { Twitter } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  onAuthClick: () => void;
}

export function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-2 px-4 py-1.5 mb-8">
        <Link 
          href="https://x.com/madebyjace"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border hover:bg-gray-50 transition-colors"
        >
          <Twitter className="h-4 w-4" />
          <span>by @madebyjace</span>
        </Link>
        <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">
          Beta phase access
        </span>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
        The easiest way to<br />develop in bolt
      </h1>
      <p className="text-xl text-gray-600 mb-12">
        #1 Composers.dev & Cursor Boilerplates
      </p>
      
      <div className="w-full max-w-xl mx-auto">
        <div className="relative flex items-center">
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full px-6 py-4 text-lg rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-40"
          />
          <Button 
            size="lg"
            className="absolute right-2 rounded-full px-6 py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={onAuthClick}
          >
            Get started
          </Button>
        </div>
        <div className="mt-4 text-sm text-green-500 bg-green-50 px-4 py-1 rounded-full inline-block">
          33 people joined today!
        </div>
      </div>
    </div>
  )
} 