import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void
  isKeyValid: boolean
}

export function ApiKeyInput({ onApiKeySubmit, isKeyValid }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApiKeySubmit(apiKey)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">OpenAI API Key</Label>
        <div className="relative">
          <Input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="pr-10"
          />
          {apiKey && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isKeyValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full">
        Save API Key
      </Button>
    </form>
  )
}

