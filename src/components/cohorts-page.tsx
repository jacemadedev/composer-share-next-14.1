import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CohortsPage() {
  const cohorts = [
    { name: 'Classical Composers', members: 15, description: 'A group for classical music composers' },
    { name: 'Jazz Ensemble', members: 8, description: 'Collaborative jazz composition cohort' },
    { name: 'Electronic Music Producers', members: 20, description: 'For electronic and experimental music creators' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Composer Cohorts</h1>
      <div className="grid gap-4">
        {cohorts.map((cohort, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{cohort.name}</CardTitle>
              <CardDescription>{cohort.members} members</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{cohort.description}</p>
              <div className="flex mt-4 space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Avatar key={i}>
                    <AvatarImage src={`https://i.pravatar.cc/32?img=${index * 3 + i}`} />
                    <AvatarFallback>M{i + 1}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

