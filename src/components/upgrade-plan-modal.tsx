import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface UpgradePlanModalProps {
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
  userId: string
}

export function UpgradePlanModal({ isOpen, onClose, isAuthenticated, userId }: UpgradePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly")
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    setIsLoading(true)
    const priceId = selectedPlan === 'monthly' 
      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
      : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail: user?.email,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Error redirecting to checkout:', error)
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    "Access to all starter kits",
    "Collaborate with other developers",
    "Priority support",
    "Advanced AI features",
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs and unlock premium features.
          </DialogDescription>
        </DialogHeader>
        {!isAuthenticated ? (
          <div className="py-6">
            <p className="text-center text-red-500">Please sign in to upgrade your plan.</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-6">
              <RadioGroup value={selectedPlan} onValueChange={(value: "monthly" | "yearly") => setSelectedPlan(value)}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly - $97/month</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly">Yearly - $495/year (Save $669!)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Premium Benefits:</h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpgrade} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

