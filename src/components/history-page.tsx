import { Dispatch, SetStateAction } from 'react'

type Message = {
  content: string;
  sender: 'user' | 'assistant';
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
}

interface HistoryPageProps {
  conversations: Conversation[];
  setCurrentConversation: Dispatch<SetStateAction<Conversation | null>>;
}

export default function HistoryPage({ conversations, setCurrentConversation }: HistoryPageProps) {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Chat History</h1>
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => setCurrentConversation(conversation)}
          >
            <h2 className="font-semibold">{conversation.title}</h2>
            <p className="text-sm text-gray-500">
              {conversation.messages.length} messages
            </p>
          </div>
        ))}
        {conversations.length === 0 && (
          <p className="text-center text-gray-500">No chat history yet</p>
        )}
      </div>
    </div>
  )
}

