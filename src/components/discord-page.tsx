import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

export default function DiscordPage() {
  const DISCORD_INVITE_URL = "https://discord.gg/HmCecGnRAt"

  const handleJoinDiscord = () => {
    window.open(DISCORD_INVITE_URL, '_blank')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Join Our Community</h1>
        <p className="text-gray-600 mb-6">
          Get help with debugging, share your experiences, and connect with other developers.
        </p>
        <Button 
          size="lg"
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-8"
          onClick={handleJoinDiscord}
        >
          <MessageSquare className="mr-2 h-5 w-5" />
          Join Discord Server
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <iframe 
            src="https://discord.com/widget?id=1304645509952311376&theme=dark" 
            width="100%" 
            height="500" 
            allowTransparency={true} 
            frameBorder="0" 
            sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            className="rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  )
} 