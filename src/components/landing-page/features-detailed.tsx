import { Code2, Lock, Zap, Palette, Users, GitBranch } from 'lucide-react'

export function FeaturesDetailed() {
  const features = [
    {
      icon: Code2,
      title: "Modern Development Stack",
      description: "Built with Next.js 14, TypeScript, and Tailwind CSS for a modern development experience.",
      details: [
        "App Router & Server Components",
        "Type-safe development",
        "Responsive design system"
      ]
    },
    {
      icon: Lock,
      title: "Authentication & Security",
      description: "Production-ready authentication and security features powered by Supabase.",
      details: [
        "Social authentication",
        "Role-based access control",
        "Protected API routes"
      ]
    },
    {
      icon: Zap,
      title: "AI Integration",
      description: "Ready-to-use AI features with OpenAI integration and proper token management.",
      details: [
        "Chat interface",
        "Code generation",
        "Token usage tracking"
      ]
    },
    {
      icon: Palette,
      title: "UI Components",
      description: "Beautiful, accessible components built with Radix UI and styled with Tailwind.",
      details: [
        "Dark mode support",
        "Animation primitives",
        "Customizable themes"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Built-in features for team collaboration and project management.",
      details: [
        "Real-time updates",
        "Shared workspaces",
        "Activity tracking"
      ]
    },
    {
      icon: GitBranch,
      title: "Developer Experience",
      description: "Optimized for the best possible developer experience.",
      details: [
        "Hot reload",
        "Type checking",
        "Code formatting"
      ]
    }
  ]

  return (
    <div className="py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">Everything You Need</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          A complete development stack with all the features you need to build modern AI-powered applications
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center gap-3">
                <feature.icon className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
              <ul className="space-y-2">
                {feature.details.map((detail, i) => (
                  <li key={i} className="text-sm text-gray-500">• {detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 