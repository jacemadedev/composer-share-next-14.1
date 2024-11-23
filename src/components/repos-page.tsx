import { useState, useMemo } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitFork, Search } from 'lucide-react'

interface StarterKit {
  id: string;
  name: string;
  description: string;
  tags: string[];
  repoUrl: string;
}

const starterKits: StarterKit[] = [
  {
    id: '1',
    name: 'next-composer',
    description: 'A Next.js boilerplate for bolt.new,cursor & v0 developers.',
    tags: ['next.js', 'supabase auth', 'supabase db', 'open ai api', 'typescript', 'Stripe'],
    repoUrl: 'https://github.com/yourusername/next-composer'
  },
  {
    id: '2',
    name: 'composer-studio',
    description: 'A Vite boilerplate that allows users to create logos with AI',
    tags: ['Vite', 'supabase auth', 'supabase db', 'open ai api', 'Photoroom', 'Stripe'],
    repoUrl: 'https://github.com/yourusername/composer-studio'
  },
  {
    id: '3',
    name: 'composer-cut',
    description: 'A Vite boilerplate that turns UI screenshots into 3D videos',
    tags: ['Vite', 'supabase auth', 'supabase db', 'ffmpeg.wasm'],
    repoUrl: 'https://github.com/yourusername/composer-cut'
  },
  {
    id: '4',
    name: 'composer-flow',
    description: 'A react flow boilerplate with Open AI to create a unique experience',
    tags: ['Vite', 'typescript', 'open ai api', 'supabase db', 'supabase auth'],
    repoUrl: 'https://github.com/yourusername/composer-flow'
  }
]

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredKits = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    if (!query) return starterKits

    return starterKits.filter(kit => {
      const searchableContent = [
        kit.name,
        kit.description,
        ...kit.tags
      ].map(item => item.toLowerCase())

      return searchableContent.some(content => content.includes(query))
    })
  }, [searchQuery])

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Starter Kits</h1>
        <div className="relative max-w-md">
          <Input
            placeholder="Search by name, description, or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">
          {filteredKits.length === starterKits.length 
            ? `Showing all ${starterKits.length} starter kits` 
            : `Found ${filteredKits.length} starter kit${filteredKits.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {filteredKits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">
            No starter kits found matching &quot;{searchQuery}&quot;
          </p>
          <Button 
            variant="ghost" 
            className="mt-4"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredKits.map((kit) => (
            <Card 
              key={kit.id} 
              className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="space-y-4 pb-4">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  {kit.name}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 leading-relaxed">
                  {kit.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-6">
                <div className="flex flex-wrap gap-1.5">
                  {kit.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 py-5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200"
                  onClick={() => window.open(kit.repoUrl, '_blank')}
                >
                  <GitFork className="h-4 w-4" />
                  Fork Repo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

