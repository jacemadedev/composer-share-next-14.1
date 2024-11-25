import { Button } from '@/components/ui/button'
import { GitBranch, GitPullRequest, Search, BookOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SuggestedTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export default function SuggestedTopics({ onTopicSelect }: SuggestedTopicsProps) {
  const router = useRouter()
  const topics = [
    { 
      icon: GitBranch, 
      label: "Debug my error message",
      description: "Get help understanding and fixing error messages"
    },
    { 
      icon: GitPullRequest, 
      label: "Review my code for bugs",
      description: "Analyze code for potential issues and improvements" 
    },
    { 
      icon: Search, 
      label: "Optimize performance",
      description: "Find and fix performance bottlenecks"
    },
    { 
      icon: BookOpen, 
      label: "Explain error patterns",
      description: "Learn about common error patterns and solutions"
    },
  ]

  const handleTopicClick = (topic: string) => {
    onTopicSelect(topic)
    router.push(`/chat?q=${encodeURIComponent(topic)}`)
  }

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
      {topics.map((topic, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full h-auto py-3 md:py-4 px-4 md:px-6 justify-start text-left hover:bg-gray-100 transition-colors"
          onClick={() => handleTopicClick(topic.label)}
        >
          <topic.icon className="h-5 w-5 md:h-6 md:w-6 mr-3 md:mr-4 flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="text-gray-900 text-sm md:text-base font-medium">
              {topic.label}
            </span>
            <span className="text-gray-500 text-xs md:text-sm">
              {topic.description}
            </span>
          </div>
        </Button>
      ))}
    </div>
  )
}

