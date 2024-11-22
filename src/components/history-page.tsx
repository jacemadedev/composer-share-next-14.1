import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import HistoryItem from './history-item'

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

export default function HistoryPage() {
  const [conversations] = useState<Conversation[]>([
    { id: '1', title: 'Repo Structure Analysis', lastMessage: 'Here\'s the analysis of your repo structure...', timestamp: '2 hours ago' },
    { id: '2', title: 'PR Review', lastMessage: 'I\'ve reviewed your latest PR. Here are my comments...', timestamp: '1 day ago' },
    { id: '3', title: 'Code Search', lastMessage: 'I found 3 instances of the code you\'re looking for...', timestamp: '3 days ago' },
    { id: '4', title: 'File Explanation', lastMessage: 'This file contains the main routing logic for your app...', timestamp: '1 week ago' },
  ])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Conversation History</h1>
      <div className="mb-6 relative">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <div className="space-y-4">
        {filteredConversations.map((conversation) => (
          <HistoryItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  )
}

