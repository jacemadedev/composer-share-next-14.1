import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CommunityPage() {
  const discussions = [
    { title: 'Tips for orchestration', author: 'JohnDoe', replies: 23, views: 156 },
    { title: 'Favorite composition software?', author: 'JaneSmith', replies: 45, views: 302 },
    { title: 'Collaborating remotely: Best practices', author: 'MusicLover', replies: 17, views: 89 },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Community Discussions</h1>
      <div className="grid gap-4">
        {discussions.map((discussion, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{discussion.title}</CardTitle>
              <CardDescription>Started by {discussion.author}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{discussion.replies} replies | {discussion.views} views</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

