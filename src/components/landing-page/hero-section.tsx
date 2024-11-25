import { Button } from '@/components/ui/button'
import { Twitter } from 'lucide-react'
import Link from 'next/link'

interface HeroSectionProps {
  onAuthClick: () => void;
}

const TECH_BADGES = [
  { label: "Next.js", color: "bg-black text-white" },
  { label: "Vite", color: "bg-purple-500/10 text-purple-700" },
  { label: "React", color: "bg-blue-500/10 text-blue-700" },
  { label: "TypeScript", color: "bg-blue-600/10 text-blue-800" },
  { label: "Supabase", color: "bg-emerald-500/10 text-emerald-700" },
  { label: "OpenAI", color: "bg-green-500/10 text-green-700" },
  { label: "Photoroom", color: "bg-pink-500/10 text-pink-700" },
  { label: "FFMPEG", color: "bg-orange-500/10 text-orange-700" },
  { label: "Stripe", color: "bg-indigo-500/10 text-indigo-700" },
  { label: "Vercel", color: "bg-gray-900/10 text-gray-700" },
  { label: "Tailwind", color: "bg-cyan-500/10 text-cyan-700" },
  { label: "shadcn/ui", color: "bg-slate-500/10 text-slate-700" },
  { label: "Framer Motion", color: "bg-purple-400/10 text-purple-600" },
  { label: "ESLint", color: "bg-violet-500/10 text-violet-700" },
  { label: "Prettier", color: "bg-pink-400/10 text-pink-600" }
]

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
      <p className="text-xl text-gray-600 mb-6">
        #1 Composers.dev & Cursor Boilerplates
      </p>

      {/* Tech Stack Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl">
        {TECH_BADGES.map((tech, index) => (
          <span
            key={index}
            className={`px-3 py-1 text-sm rounded-full ${tech.color} font-medium`}
          >
            {tech.label}
          </span>
        ))}
      </div>
      
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