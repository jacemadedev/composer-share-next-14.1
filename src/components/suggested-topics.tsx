import { Button } from '@/components/ui/button'
import { GitBranch, GitPullRequest, Search, BookOpen } from 'lucide-react'

interface SuggestedTopicsProps {
  onTopicSelect: (topic: string) => void;
}

export default function SuggestedTopics({ onTopicSelect }: SuggestedTopicsProps) {
  const topics = [
    { icon: GitBranch, label: 'Analyze my repo structure' },
    { icon: GitPullRequest, label: 'Review my latest PR' },
    { icon: Search, label: 'Find code in my repos' },
    { icon: BookOpen, label: 'Explain a file in my repo' },
  ]

  return (
    <div className="w-full space-y-4">
      {topics.map((topic, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full h-auto py-4 px-6 justify-start text-left hover:bg-gray-100 transition-colors"
          onClick={() => onTopicSelect(topic.label)}
        >
          <topic.icon className="h-6 w-6 mr-4" />
          <span className="text-gray-700">{topic.label}</span>
        </Button>
      ))}
    </div>
  )
}

