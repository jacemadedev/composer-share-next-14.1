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
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
      {topics.map((topic, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full h-auto py-3 md:py-4 px-4 md:px-6 justify-start text-left hover:bg-gray-100 transition-colors"
          onClick={() => onTopicSelect(topic.label)}
        >
          <topic.icon className="h-5 w-5 md:h-6 md:w-6 mr-3 md:mr-4 flex-shrink-0" />
          <span className="text-gray-700 text-sm md:text-base">{topic.label}</span>
        </Button>
      ))}
    </div>
  )
}

