"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

export function SettingsModal(props: SettingsModalProps) {
  const { isOpen, onClose } = props
  const { user } = useAuth()
  const [theme, setTheme] = useState('light')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchSettings = async () => {
        const { data, error } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', user.id)
          .single()

        if (!error && data?.theme) {
          setTheme(data.theme)
        }
      }

      fetchSettings()
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      console.error('No user ID found')
      return
    }

    setIsLoading(true)

    try {
      const updateData: UserSettingsUpdate = {
        theme,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', user.id)

      if (error) throw error

      onClose()
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your app preferences
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark">Dark</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 