'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/sidebar'
import SearchBar from '@/components/search-bar'
import SuggestedTopics from '@/components/suggested-topics'
import ReposPage from '@/components/repos-page'
import DiscordPage from '@/components/discord-page'
import HistoryPage from '@/components/history-page'
import ChatInterface from '@/components/chat-interface'
import { AuthModal } from '@/components/auth-modal'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams, useRouter } from 'next/navigation'
import LoadingScreen from '@/components/loading-screen'
import ErrorScreen from '@/components/error-screen'
import { Button } from '@/components/ui/button'
import { UpgradePlanModal } from '@/components/upgrade-plan-modal'
import { cn } from '@/lib/utils'
import { WelcomeModal } from '@/components/welcome-modal'

type Conversation = {
  id: string;
  title: string;
  messages: { content: string; sender: 'user' | 'assistant' }[];
}

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showChat, setShowChat] = useState(false)
  const [initialMessage, setInitialMessage] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, subscription, plan, isLoading, error, refreshSubscription } = useAuth()
  const isAuthenticated = !!user
  const searchParams = useSearchParams()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)

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
          window.history.replaceState({}, '', '/')
        } catch (err) {
          console.error('Error verifying session:', err)
        }
      }
      verifySession()
    }
  }, [searchParams, refreshSubscription])

  useEffect(() => {
    if (user) {
      refreshSubscription()
    }
  }, [user, refreshSubscription])

  useEffect(() => {
    if (user && (!subscription || subscription.status !== 'active') && plan !== 'premium') {
      const lastShown = localStorage.getItem('welcomeModalLastShown')
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      
      if (!lastShown || Date.now() - parseInt(lastShown) > sevenDaysInMs) {
        setShowWelcomeModal(true)
      }
    }
  }, [user, subscription, plan])

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

  const handleSearch = async (query: string) => {
    console.log('Searching:', query)
    router.push(`/chat?q=${encodeURIComponent(query)}`)
  }

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false)
    localStorage.setItem('welcomeModalLastShown', Date.now().toString())
  }

  const renderPage = () => {
    const isPremiumUser = subscription?.status === 'active' || plan === 'premium'

    switch (currentPage) {
      case 'repos':
        return isPremiumUser ? (
          <ReposPage />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
            <p className="mb-4">This feature is only available to premium users.</p>
            <Button onClick={() => setIsUpgradeModalOpen(true)}>
              Upgrade to Premium
            </Button>
          </div>
        )
      case 'discord':
        return isPremiumUser ? (
          <DiscordPage />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
            <p className="mb-4">This feature is only available to premium users.</p>
            <Button onClick={() => setIsUpgradeModalOpen(true)}>
              Upgrade to Premium
            </Button>
          </div>
        )
      case 'history':
        return isPremiumUser ? (
          <HistoryPage />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
            <h2 className="text-2xl font-bold mb-4">Premium Feature</h2>
            <p className="mb-4">This feature is only available to premium users.</p>
            <Button onClick={() => setIsUpgradeModalOpen(true)}>
              Upgrade to Premium
            </Button>
          </div>
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
                  />
                </div>
              )}
              <h1 className="text-4xl font-bold text-center text-gray-900">
                AI Debug Assistant
              </h1>
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Paste your error message or describe the issue..."
              />
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Common Debugging Actions
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
        isAuthenticated={isAuthenticated}
        onSignInClick={() => setShowAuthModal(true)}
        user={user}
        isPremium={subscription?.status === 'active' || plan === 'premium'}
        plan={plan}
      />
      <main className={cn(
        "flex-1 transition-all duration-300",
        "p-4 md:p-8", // Smaller padding on mobile
        "md:ml-64", // Only add margin on desktop
        "w-full" // Full width on mobile
      )}>
        {renderPage()}
      </main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      {isAuthenticated && (
        <>
          <UpgradePlanModal
            isOpen={isUpgradeModalOpen}
            onClose={() => setIsUpgradeModalOpen(false)}
            isAuthenticated={isAuthenticated}
            userId={user?.id || ''}
          />
          <WelcomeModal 
            isOpen={showWelcomeModal}
            onClose={handleWelcomeModalClose}
            onUpgrade={() => {
              handleWelcomeModalClose()
              setIsUpgradeModalOpen(true)
            }}
          />
        </>
      )}
    </div>
  )
}

