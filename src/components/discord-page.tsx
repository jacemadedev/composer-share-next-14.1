import { Card, CardContent } from "@/components/ui/card"

export default function DiscordPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Discord Community</h1>
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
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
    </div>
  )
} 