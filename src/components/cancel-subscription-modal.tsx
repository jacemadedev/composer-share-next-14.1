import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { toast } from "sonner"

interface CancelSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function CancelSubscriptionModal({ isOpen, onClose, userId }: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      })
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error accessing portal:', error)
      toast.error('Failed to process cancellation')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              By canceling your subscription, you will lose access to all premium features, including:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Access to Starter Kits</li>
              <li>Commercial usage rights</li>
              <li>Discord community access</li>
              <li>Chat history</li>
            </ul>
            <p className="font-medium text-red-600">
              This action cannot be undone immediately. You will need to resubscribe to regain access.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep my subscription</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Yes, I understand"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 