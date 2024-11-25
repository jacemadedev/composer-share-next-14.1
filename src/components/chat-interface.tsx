import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Settings, AlertCircle, FileCode, Copy, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SettingsModal } from './settings-modal'
import { generateUUID } from '@/lib/chat-utils'
import { useRouter } from 'next/navigation'

type ErrorContext = {
  errorType: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  stackTrace?: string[];
}

type Message = {
  content: string;
  sender: 'user' | 'assistant';
  errorContext?: ErrorContext;
}

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  errorContext?: ErrorContext;
}

interface ChatInterfaceProps {
  initialMessage?: string;
  conversation?: Conversation;
  onUpdateConversation?: (conversation: Conversation) => void;
  apiKey?: string;
}

export default function ChatInterface({ 
  initialMessage, 
  conversation: initialConversation,
  onUpdateConversation,
  apiKey: externalApiKey
}: ChatInterfaceProps) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(externalApiKey || null)
  const [showSettings, setShowSettings] = useState(false)
  const [isProcessingInitial, setIsProcessingInitial] = useState(false)
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>(
    initialConversation?.messages || []
  )

  const createNewConversation = useCallback((msgs: Message[]): Conversation => ({
    id: initialConversation?.id || generateUUID(),
    title: initialConversation?.title || 'New Conversation',
    messages: msgs
  }), [initialConversation])

  const fetchApiKey = useCallback(async () => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching API key:', error)
        return null
      }

      const key = data?.openai_api_key || null
      if (key) {
        setApiKey(key)
        return key
      }
      return null
    } catch (error) {
      console.error('Error in fetchApiKey:', error)
      return null
    }
  }, [user])

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false)
    fetchApiKey()
  }, [fetchApiKey])

  useEffect(() => {
    if (user) {
      fetchApiKey()
    }
  }, [user, fetchApiKey])

  useEffect(() => {
    if (externalApiKey) {
      setApiKey(externalApiKey)
    }
  }, [externalApiKey])

  const saveChatToHistory = useCallback(async (updatedConversation: Conversation) => {
    if (!user) return

    try {
      const chatId = updatedConversation.id
      const timestamp = new Date().toISOString()
      
      const chatData = {
        id: chatId,
        user_id: user.id,
        title: updatedConversation.title,
        messages: updatedConversation.messages,
        updated_at: timestamp,
        created_at: timestamp
      }

      const { error } = await supabase
        .from('chat_history')
        .upsert(chatData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })

      if (error) {
        console.error('Error saving chat history:', error)
      }
    } catch (error) {
      console.error('Error in saveChatToHistory:', error)
    }
  }, [user])

  const detectErrorContext = (message: string): ErrorContext | undefined => {
    // Common error patterns
    const errorPatterns = [
      /(?:TypeError|ReferenceError|SyntaxError|RangeError):\s*(.*?)(?:\n|$)/,
      /Error:\s*(.*?)(?:\n|$)/,
      /Failed to compile.*\n\n(.*?)(?:\n|$)/,
      /^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/m
    ]

    // Stack trace pattern
    const stackTracePattern = /^\s*at\s+.+?\s+\(.+?\)/gm

    let errorContext: ErrorContext | undefined

    // Try to match error patterns
    for (const pattern of errorPatterns) {
      const match = message.match(pattern)
      if (match) {
        errorContext = {
          errorType: match[0].split(':')[0].trim(),
          filePath: match[2]?.trim(),
          lineNumber: parseInt(match[3]),
          columnNumber: parseInt(match[4]),
          stackTrace: message.match(stackTracePattern)?.map(line => line.trim())
        }
        break
      }
    }

    // If no structured error found, but message contains common error keywords
    if (!errorContext && /error|exception|failed|invalid/i.test(message)) {
      errorContext = {
        errorType: 'Error',
        filePath: undefined,
        stackTrace: undefined
      }
    }

    return errorContext
  }

  const handleSend = useCallback(async (message: string = input) => {
    if (!message.trim() || !apiKey) return

    // Check for error context in the message
    const errorContext = detectErrorContext(message.trim())
    
    const newMessage: Message = { 
      content: message.trim(), 
      sender: 'user',
      errorContext 
    }

    const updatedMessages = [...messages, newMessage]
    const updatedConversation = createNewConversation(updatedMessages)
    
    if (onUpdateConversation) {
      onUpdateConversation(updatedConversation)
    }

    // Update URL with conversation ID if it's a new conversation
    if (!initialConversation?.id) {
      window.history.replaceState({}, '', `/chat?id=${updatedConversation.id}`)
    }

    try {
      // Modify system prompt to focus on debugging
      const systemPrompt = errorContext 
        ? 'You are an expert debugging assistant. When analyzing errors, provide clear step-by-step explanations and practical solutions. Focus on the specific error context provided and suggest best practices to prevent similar issues.'
        : 'You are an AI debugging assistant focused on helping developers understand and fix code issues. Provide clear explanations and actionable solutions.'

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content,
              // Include error context in the message to GPT
              ...(msg.errorContext && {
                context: {
                  error: msg.errorContext.errorType,
                  file: msg.errorContext.filePath,
                  line: msg.errorContext.lineNumber,
                  stack: msg.errorContext.stackTrace,
                  // Add additional debugging context
                  severity: msg.errorContext.errorType.includes('Error') ? 'error' : 'warning',
                  timestamp: new Date().toISOString()
                }
              })
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
        sender: 'assistant',
        // AI response doesn't need error context
        errorContext: undefined
      }
      
      const finalMessages = [...updatedMessages, aiResponse]
      const finalConversation = createNewConversation(finalMessages)
      
      if (onUpdateConversation) {
        onUpdateConversation(finalConversation)
      }
      
      await saveChatToHistory(finalConversation)
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      // Handle API errors with appropriate UI feedback
      const errorMessage: Message = {
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'assistant',
        errorContext: {
          errorType: 'API Error',
          filePath: undefined,
          stackTrace: error instanceof Error ? [error.message] : undefined
        }
      }
      const finalMessages = [...updatedMessages, errorMessage]
      const finalConversation = createNewConversation(finalMessages)
      
      if (onUpdateConversation) {
        onUpdateConversation(finalConversation)
      }
    }

    setInput('')
  }, [input, apiKey, messages, onUpdateConversation, saveChatToHistory, createNewConversation, initialConversation])

  useEffect(() => {
    const handleInitialMessage = async () => {
      if (
        initialMessage && 
        apiKey && 
        !isProcessingInitial && 
        messages.length === 1 && 
        messages[0].content === initialMessage
      ) {
        try {
          setIsProcessingInitial(true)
          
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
                { role: 'user', content: initialMessage }
              ],
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to get response from OpenAI')
          }

          const data = await response.json()
          const aiResponse: Message = { 
            content: data.choices[0].message.content, 
            sender: 'assistant' as const
          }

          const updatedConversation = createNewConversation([...messages, aiResponse])
          
          if (onUpdateConversation) {
            onUpdateConversation(updatedConversation)
          }
          
          await saveChatToHistory(updatedConversation)
        } catch (error) {
          console.error('Error processing initial message:', error)
        } finally {
          setIsProcessingInitial(false)
        }
      }
    }

    handleInitialMessage()
  }, [initialMessage, apiKey, isProcessingInitial, messages, onUpdateConversation, saveChatToHistory, createNewConversation])

  // Load existing conversation on mount
  useEffect(() => {
    if (initialConversation) {
      setMessages(initialConversation.messages)
    }
  }, [initialConversation])

  const renderMessage = (message: Message) => {
    if (message.errorContext) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">
              {message.errorContext.errorType}
            </span>
          </div>

          {message.errorContext.filePath && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileCode className="h-4 w-4" />
              <span>
                {message.errorContext.filePath}
                {message.errorContext.lineNumber && 
                  `:${message.errorContext.lineNumber}`}
                {message.errorContext.columnNumber && 
                  `:${message.errorContext.columnNumber}`}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-6 px-2"
                onClick={() => navigator.clipboard.writeText(message.errorContext?.filePath || '')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {message.errorContext.stackTrace && (
            <div className="bg-gray-50 rounded-md p-3 text-sm font-mono">
              {message.errorContext.stackTrace.map((line, index) => (
                <div 
                  key={index}
                  className="hover:bg-gray-100 px-2 py-1 flex items-center justify-between"
                >
                  <span className="text-gray-600">{line}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 hover:opacity-100 h-6 px-2"
                    onClick={() => navigator.clipboard.writeText(line)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 text-gray-700">
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <p className="text-sm md:text-base">{message.content}</p>
    )
  }

  if (apiKey === null) {
    return (
      <Card className="w-full h-screen">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">OpenAI API Key Required</h2>
          <p className="text-gray-600 mb-6">
            Please configure your OpenAI API key in settings to use the chat feature.
          </p>
          <Button 
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Configure API Key
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full h-screen flex flex-col">
        <CardContent className="p-3 md:p-6 flex-1 flex flex-col">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] p-2 md:p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? message.errorContext
                        ? 'bg-amber-50 text-gray-900 border border-amber-200' // Error message from user
                        : 'bg-blue-500 text-white'  // Normal user message
                      : message.errorContext
                        ? 'bg-amber-50 border border-amber-200 text-gray-900' // Error message from assistant
                        : 'bg-gray-200 text-gray-800' // Normal assistant message
                  }`}
                >
                  {renderMessage(message)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="text-sm md:text-base"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              onClick={() => handleSend()}
              className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={handleSettingsClose} 
      />
    </>
  )
}

