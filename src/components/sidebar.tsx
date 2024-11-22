import { useState } from 'react'
import { Home, BookOpen, Users, Clock, Settings, LogOut, CreditCard, ChevronRight, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils' // Updated import path
import { supabase } from '@/lib/supabase'
import { UpgradePlanModal } from './upgrade-plan-modal'
import { UpgradePrompt } from './upgrade-prompt' // Assuming UpgradePrompt is a new component

type NavItem = {
  icon: React.ElementType;
  label: string;
  page: string;
  isPremium?: boolean; // Add isPremium property
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', page: 'home', isPremium: false },
  { icon: BookOpen, label: 'Starter Kits', page: 'repos', isPremium: true },
  { icon: Users, label: 'Collaborators', page: 'collaborators', isPremium: true },
  { icon: Clock, label: 'History', page: 'history', isPremium: true },
]

interface SidebarProps {
  setCurrentPage: (page: string) => void;
  isAuthenticated: boolean;
  onSignInClick: () => void;
  user: any | null;
  isPremium: boolean; // Add this line
}

export default function Sidebar({ setCurrentPage, isAuthenticated, onSignInClick, user, isPremium }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeItem, setActiveItem] = useState('home')
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false) // New state for upgrade prompt

  const handleNavClick = (page: string, isPremiumPage: boolean) => { // Updated function
    if (isPremiumPage && !isPremium) {
      setShowUpgradePrompt(true)
    } else {
      setCurrentPage(page)
      setActiveItem(page)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 ease-in-out fixed h-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 mr-2 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Composer Kit</span>
                <span className="text-xs text-gray-500">AI Assistant</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-grow py-6">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.page}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full text-gray-700 hover:bg-gray-100 transition-colors",
                    activeItem === item.page && "bg-blue-50 text-blue-700",
                    isCollapsed ? "justify-center" : "justify-start px-4"
                  )}
                  onClick={() => handleNavClick(item.page, item.isPremium)} // Updated onClick
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  {!isCollapsed && item.isPremium && !isPremium && (
                    <CreditCard className="ml-auto h-4 w-4 text-yellow-500" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && isAuthenticated && (
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 mb-4"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-center p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>{user?.user_metadata?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <span className="ml-2 flex-grow text-left">{user?.user_metadata?.name || 'User'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onSignInClick} className="w-full">
              Sign In
            </Button>
          )}
        </div>
      </div>
      {isAuthenticated && (
        <UpgradePlanModal 
          isOpen={isUpgradeModalOpen} 
          onClose={() => setIsUpgradeModalOpen(false)} 
          isAuthenticated={isAuthenticated}
          userId={user?.id || ''}
        />
      )}
      {showUpgradePrompt && ( // Added UpgradePrompt component
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => setIsUpgradeModalOpen(true)}
        />
      )}
    </aside>
  )
}

