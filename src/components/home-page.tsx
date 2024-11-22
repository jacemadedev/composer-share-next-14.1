'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import SearchBar from '@/components/search-bar'
import SuggestedTopics from '@/components/suggested-topics'
import ReposPage from '@/components/repos-page'
import CollaboratorsPage from '@/components/collaborators-page'
import HistoryPage from '@/components/history-page'
import ChatInterface from '@/components/chat-interface'
import { AuthModal } from '@/components/auth-modal'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import LoadingScreen from '@/components/loading-screen'
import ErrorScreen from '@/components/error-screen'
import { supabase } from '@/lib/supabase'

type Conversation = {
  id: string;
  title: string;
  messages: { content: string; sender: 'user' | 'assistant' }[];
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('home')
  const [showChat, setShowChat] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, subscription, isLoading, error, refreshSubscription } = useAuth()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<string | null>(null)

  // Handle Stripe checkout return
  useEffect(() => {
    const sessionId = searchParams?.get('session_id')
    if (sessionId) {
      const verifySession = async () => {
        try {
          const response = await fetch(`/api/verify-session?session_id=${sessionId}`)
          if (!response.ok) {
            throw new Error('Failed to verify session')
          }
          await refreshSubscription()
          // Use replace instead of href to avoid page reload
          window.history.replaceState({}, '', window.location.pathname)
        } catch (err) {
          console.error('Error verifying session:', err)
        }
      }
      verifySession()
    }
  }, [searchParams, refreshSubscription])

  const handleApiKeySubmit = async (key: string) => {
    setApiKey(key)
    if (user) {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, openai_api_key: key })
      if (error) {
        console.error('Error saving API key:', error)
      }
    }
  }

  const handleTopicSelect = (topic: string) => {
    setShowChat(true)
    setInitialMessage(topic)
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: topic,
      messages: [{ content: topic, sender: 'user' }],
    }
    setConversations([...conversations, newConversation])
    setCurrentConversation(newConversation)
  }

  const handleSearch = (query: string) => {
    setShowChat(true)
    setInitialMessage(`Search for: ${query}`)
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: `Search: ${query}`,
      messages: [{ content: `Search for: ${query}`, sender: 'user' }],
    }
    setConversations([...conversations, newConversation])
    setCurrentConversation(newConversation)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'repos':
        return <ReposPage />
      case 'collaborators':
        return <CollaboratorsPage />
      case 'history':
        return (
          <HistoryPage
            conversations={conversations}
            setCurrentConversation={setCurrentConversation}
          />
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="w-full max-w-4xl px-6 space-y-8">
              {showChat && currentConversation && (
                <div className="mb-8 w-full">
                  <ChatInterface
                    initialMessage={initialMessage}
                    conversation={currentConversation}
                    onUpdateConversation={(updatedConversation) => {
                      setConversations(
                        conversations.map((conv) =>
                          conv.id === updatedConversation.id
                            ? updatedConversation
                            : conv
                        )
                      )
                      setCurrentConversation(updatedConversation)
                    }}
                    apiKey={apiKey}
                    onApiKeySubmit={handleApiKeySubmit}
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold text-center text-gray-900">
                GitAssist: Your Repo Assistant
              </h1>
              <SearchBar onSearch={handleSearch} />
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Suggested Actions
                </h2>
                <SuggestedTopics onTopicSelect={handleTopicSelect} />
              </div>
            </div>
          </div>
        )
    }
  }

  if (error) {
    return <ErrorScreen message={error} />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        setCurrentPage={setCurrentPage}
        isAuthenticated={!!user}
        onSignInClick={() => setShowAuthModal(true)}
        user={user}
        isPremium={plan === 'premium'}
        plan={plan}
      />
      <main className="flex-1 ml-64 p-8">{renderPage()}</main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

