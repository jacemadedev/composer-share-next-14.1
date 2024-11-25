import { Button } from '@/components/ui/button'
import { Terminal, Copy, ArrowRight } from 'lucide-react'

export function GettingStarted() {
  const steps = [
    {
      title: "Clone the repository",
      command: "git clone https://github.com/yourusername/composer-kit.git",
    },
    {
      title: "Install dependencies",
      command: "npm install",
    },
    {
      title: "Set up environment variables",
      command: "cp .env.example .env.local",
    },
    {
      title: "Start development server",
      command: "npm run dev",
    }
  ]

  return (
    <div className="py-24 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">Get Started in Minutes</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          Follow these simple steps to start building your next project
        </p>
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-400">{step.title}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => navigator.clipboard.writeText(step.command)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <pre className="bg-black bg-opacity-50 p-3 rounded text-blue-400 font-mono text-sm">
                {step.command}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            View Documentation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 