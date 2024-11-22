import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GitFork, Search, ExternalLink } from 'lucide-react'

type Member = {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  repoCount: number;
  coFounderWanted: boolean;
}

export default function CollaboratorsPage() {
  const [members] = useState<Member[]>([]);

  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Collaborators</h1>
      <div className="mb-6 relative">
        <Input
          placeholder="Search collaborators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{member.name}</h2>
                  <p className="text-sm text-gray-500">@{member.username}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <GitFork className="mr-2 h-4 w-4" />
                  <span>{member.repoCount} repositories</span>
                </div>
                {member.coFounderWanted && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">Co-founder Wanted</Badge>
                )}
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View GitHub Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

