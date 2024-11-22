import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { GitFork, Eye, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type StarterKit = {
  name: string;
  description: string;
  stars: number;
  forks: number;
  tags: string[];
  previewUrl: string;
}

export default function ReposPage() {
  const [starterKits, setStarterKits] = useState<StarterKit[]>([
    {
      name: 'Next.js Boilerplate',
      description: 'A feature-rich starter for Next.js projects with TypeScript, ESLint, and Tailwind CSS.',
      stars: 1500,
      forks: 300,
      tags: ['Next.js', 'TypeScript', 'Tailwind'],
      previewUrl: 'https://nextjs-boilerplate.vercel.app',
    },
    {
      name: 'React Native Starter',
      description: 'Jump-start your mobile app development with this React Native template.',
      stars: 2800,
      forks: 450,
      tags: ['React Native', 'Expo', 'TypeScript'],
      previewUrl: 'https://expo.dev/@example/react-native-starter',
    },
    {
      name: 'Express API Boilerplate',
      description: 'A robust starting point for building RESTful APIs with Express and MongoDB.',
      stars: 3200,
      forks: 600,
      tags: ['Express', 'MongoDB', 'REST API'],
      previewUrl: 'https://github.com/example/express-api-boilerplate',
    },
  ])

  const handleFork = (kitName: string) => {
    console.log(`Forking ${kitName}`)
    // Here you would typically call an API to fork the repository
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Starter Kits & Boilerplates</h1>
      <div className="mb-6">
        <Input placeholder="Search starter kits..." className="mb-4" />
      </div>
      <div className="grid gap-6">
        {starterKits.map((kit, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{kit.name}</CardTitle>
              <CardDescription>{kit.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {kit.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary">{tag}</Badge>
                ))}
              </div>
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{kit.name} Preview</DialogTitle>
                    <DialogDescription>
                      This is a preview of the {kit.name} starter kit.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <iframe
                      src={kit.previewUrl}
                      className="w-full h-[300px] border border-gray-200 rounded"
                      title={`Preview of ${kit.name}`}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => handleFork(kit.name)}>
                <GitFork className="mr-2 h-4 w-4" />
                Fork
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

