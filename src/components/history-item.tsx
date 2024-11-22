import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageSquare } from 'lucide-react'

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface HistoryItemProps {
  conversation: Conversation;
}

export default function HistoryItem({ conversation }: HistoryItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold">{conversation.title}</h3>
          <span className="text-sm text-gray-500">{conversation.timestamp}</span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{conversation.lastMessage}</p>
        <div className="flex justify-between items-center">
          <Button variant="outline" className="text-blue-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Review
          </Button>
          <Button>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

