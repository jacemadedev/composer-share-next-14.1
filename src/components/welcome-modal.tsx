'use client'

import * as React from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface WelcomeModalProps {
  isOpen: boolean
  onClose: { bivarianceHack(): void }["bivarianceHack"]
  onUpgrade: { bivarianceHack(): void }["bivarianceHack"]
}

export function WelcomeModal({ isOpen, onClose, onUpgrade }: WelcomeModalProps) {
  const handleUpgrade = () => {
    onClose()
    onUpgrade()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-[900px] overflow-hidden border-0">
        <div className="grid sm:grid-cols-2">
          {/* Left Column - Visual Section */}
          <div className="relative hidden sm:block bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
            <div className="absolute inset-0 bg-grid-white/[0.1] [mask-image:linear-gradient(0deg,transparent,black)]" />
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-white/10 p-3.5 mb-8">
                <Zap className="h-full w-full text-white" />
              </div>
              <h2 className="text-3xl font-semibold mb-4">
                Become a member to unlock bolt.new & cursor starter kits
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Join other founders building the future with AI-powered tools with our premium boilerplates.
              </p>
              <div className="grid gap-4">
                {[
                  { number: "4+", label: "New Repos Monthly" },
                  { number: "4+", label: "Starter Repos" },
                  { number: "24/7", label: "Support" },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-xl font-semibold">{stat.number}</div>
                    <div className="text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Content Section */}
          <div className="p-8">
            <div className="sm:hidden mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Become a member to unlock repos
              </h2>
              <p className="text-gray-600">
                Elevate your development with premium features
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                {[
                  {
                    title: "Bolt.new & Cursor Exclusive",
                    description: "Next.js and Vite templates with built-in AI capabilities"
                  },
                  {
                    title: "Weekend Hackathons",
                    description: "Build with us live on Twitch every weekend"
                  },
                  {
                    title: "Stripe & Supabase",
                    description: "Pre-connected to Stripe and Supabase for a hassle free setup"
                  },
                  {
                    title: "Developer Community",
                    description: "Access to private Discord and premium support"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex gap-4 p-4 rounded-xl transition-colors",
                      "hover:bg-gray-50 cursor-default"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" 
                  size="lg"
                  onClick={handleUpgrade}
                >
                  Become a Member
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="lg"
                  onClick={onClose}
                >
                  See Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 