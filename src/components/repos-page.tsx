import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, GitFork } from 'lucide-react'

interface StarterKit {
  id: string;
  name: string;
  description: string;
  tags: string[];
  stars: number;
  forks: number;
  repoUrl: string;
}

const starterKits: StarterKit[] = [
  {
    id: '1',
    name: 'Next.js Full Stack Kit',
    description: 'Production-ready Next.js 14 template with TypeScript, Tailwind CSS, Auth, Database, and Testing setup.',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Supabase'],
    stars: 1200,
    forks: 340,
    repoUrl: 'https://github.com/yourusername/nextjs-starter'
  },
  {
    id: '2',
    name: 'React Native Starter',
    description: 'Modern React Native boilerplate with Expo, TypeScript, and essential integrations.',
    tags: ['React Native', 'Expo', 'TypeScript'],
    stars: 850,
    forks: 230,
    repoUrl: 'https://github.com/yourusername/react-native-starter'
  },
  {
    id: '3',
    name: 'MERN Stack Boilerplate',
    description: 'Complete MongoDB, Express, React, Node.js stack with authentication and deployment configs.',
    tags: ['MongoDB', 'Express', 'React', 'Node.js'],
    stars: 980,
    forks: 275,
    repoUrl: 'https://github.com/yourusername/mern-stack'
  },
  {
    id: '4',
    name: 'T3 Stack Template',
    description: 'Type-safe full stack template with tRPC, Prisma, NextAuth, and Tailwind.',
    tags: ['T3 Stack', 'tRPC', 'Prisma', 'NextAuth'],
    stars: 1500,
    forks: 420,
    repoUrl: 'https://github.com/yourusername/t3-template'
  }
]

export default function ReposPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredKits = starterKits.filter(kit => 
    kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kit.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleFork = (repoUrl: string) => {
    window.open(repoUrl, '_blank')
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Starter Kits & Boilerplates</h1>
      
      <div className="mb-6">
        <Input
          placeholder="Search starter kits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKits.map((kit) => (
          <Card key={kit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{kit.name}</CardTitle>
              <CardDescription>{kit.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {kit.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4" />
                    {kit.stars}
                  </span>
                  <span className="flex items-center">
                    <GitFork className="mr-1 h-4 w-4" />
                    {kit.forks}
                  </span>
                </div>
                <Button onClick={() => handleFork(kit.repoUrl)}>
                  <GitFork className="mr-2 h-4 w-4" />
                  Fork
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

