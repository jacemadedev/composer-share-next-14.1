"use client"

import { useState, useEffect, useCallback } from "react"
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
import { supabase, supabaseAuth } from '@/lib/supabase'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface ValidateApiKeyFunction {
  (key: string): Promise<boolean>;
  lastCall?: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: { bivarianceHack(): void }["bivarianceHack"];
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState('')
  const [isKeyValid, setIsKeyValid] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasStoredKey, setHasStoredKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [maskedKey, setMaskedKey] = useState('')

  const validateApiKey: ValidateApiKeyFunction = async (key: string): Promise<boolean> => {
    try {
      const now = Date.now()
      if (validateApiKey.lastCall && now - validateApiKey.lastCall < 1000) {
        return false
      }
      validateApiKey.lastCall = now

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      })
      const isValid = response.ok
      setIsKeyValid(isValid)
      return isValid
    } catch (error) {
      console.error('Error validating API key:', error)
      setIsKeyValid(false)
      return false
    }
  }

  validateApiKey.lastCall = 0

  const fetchApiKey = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single()

      if (!error && data?.openai_api_key) {
        setHasStoredKey(true)
        setIsKeyValid(true)
        setMaskedKey(`sk-...${data.openai_api_key.slice(-4)}`)
      } else {
        setHasStoredKey(false)
        setIsKeyValid(false)
        setMaskedKey('')
      }
    } catch (error) {
      console.error('Error fetching API key:', error)
      setHasStoredKey(false)
      setIsKeyValid(false)
      setMaskedKey('')
    }
  }, [user])

  useEffect(() => {
    if (user && isOpen) {
      fetchApiKey()
      setIsEditing(false)
      setApiKey('')
    }
  }, [user, isOpen, fetchApiKey])

  const handleClose = () => {
    setIsEditing(false)
    setApiKey('')
    onClose()
  }

  const handleSaveApiKey = async () => {
    if (!user || !apiKey) return

    setIsSaving(true)
    try {
      // Validate the API key first
      const isValid = await validateApiKey(apiKey)
      if (!isValid) {
        toast.error('Invalid OpenAI API key')
        return
      }

      // Get the session for the auth token
      const { data: { session } } = await supabaseAuth.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Save API key through our API endpoint
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ apiKey })
      })

      if (!response.ok) {
        throw new Error('Failed to save API key')
      }

      setHasStoredKey(true)
      toast.success('API key saved successfully')
      
      // Force a refresh of the parent component
      await fetchApiKey()
      onClose()
    } catch (error) {
      console.error('Error saving API key:', error)
      toast.error('Failed to save API key')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application settings and API keys.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>OpenAI API Key</Label>
            {hasStoredKey && !isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    value={maskedKey}
                    disabled
                    type="text"
                  />
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                  >
                    Edit
                  </Button>
                </div>
                {isKeyValid && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Valid API key
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  placeholder="sk-..."
                />
                {isKeyValid && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Valid API key
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setApiKey('')
              }}
            >
              Cancel
            </Button>
          )}
          {(isEditing || !hasStoredKey) && (
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKey || isSaving}
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>Save API Key</>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 