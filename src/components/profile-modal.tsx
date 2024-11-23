"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/contexts/AuthContext'
import { supabaseAuth } from '@/lib/supabase'
import { toast } from 'sonner'

interface ProfileModalProps {
  isOpen: boolean
  onClose: { (): void }
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      setName(user.user_metadata?.name || '')
    }
  }, [user, isOpen])

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const { error } = await supabaseAuth.auth.updateUser({
        data: { 
          name: name.trim(),
          avatar_url: user.user_metadata?.avatar_url
        }
      })

      if (error) throw error

      const { data: { session }, error: sessionError } = await supabaseAuth.auth.getSession()
      if (sessionError) throw sessionError

      if (session?.user) {
        // Update local state if needed through AuthContext
        // The auth listener in AuthContext should handle this automatically
      }

      toast.success('Profile updated successfully')
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
          <DialogDescription>
            Update your profile information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 