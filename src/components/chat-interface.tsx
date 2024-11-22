import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { ApiKeyInput } from './api-key-input'

type Message = {
  content: string;
  sender: 'user' | 'assistant';
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatInterfaceProps {
  initialMessage: string;
  conversation: Conversation;
  onUpdateConversation: (updatedConversation: Conversation) => void;
  apiKey: string | null;
  onApiKeySubmit: (apiKey: string) => void;
}

export default function ChatInterface({ initialMessage, conversation, onUpdateConversation, apiKey, onApiKeySubmit }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isKeyValid, setIsKeyValid] = useState(false)

  const handleSend = useCallback(async (message: string = input) => {
    if (message.trim() && apiKey) {
      const newMessage: Message = { content: message, sender: 'user' }
      const updatedMessages = [...conversation.messages, newMessage]
      const updatedConversation = { ...conversation, messages: updatedMessages }
      onUpdateConversation(updatedConversation)

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant for a Git repository management tool.' },
              ...updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
              })),
            ],
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response from OpenAI')
        }

        const data = await response.json()
        const aiResponse: Message = { 
          content: data.choices[0].message.content, 
          sender: 'assistant' 
        }
        const finalMessages = [...updatedMessages, aiResponse]
        onUpdateConversation({ ...conversation, messages: finalMessages })
      } catch (error) {
        console.error('Error calling OpenAI API:', error)
        // Handle error (e.g., show error message to user)
      }

      setInput('')
    }
  }, [input, apiKey, conversation, onUpdateConversation])

  useEffect(() => {
    if (initialMessage && conversation.messages.length === 0) {
      handleSend(initialMessage)
    }
  }, [initialMessage, conversation.messages.length, handleSend])

  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey)
    }
  }, [apiKey])

  const validateApiKey = async (key: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/engines', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      })
      setIsKeyValid(response.ok)
    } catch (error) {
      console.error('Error validating API key:', error)
      setIsKeyValid(false)
    }
  }

  if (!apiKey || !isKeyValid) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Enter Your OpenAI API Key</h2>
          <ApiKeyInput onApiKeySubmit={onApiKeySubmit} isKeyValid={isKeyValid} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
          {conversation.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={() => handleSend()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

