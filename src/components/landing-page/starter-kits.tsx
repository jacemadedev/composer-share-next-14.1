import { Button } from "@/components/ui/button"
import { GitFork, ArrowRight } from "lucide-react"

interface StarterKitsProps {
  onAuthClick: () => void
}

const STARTER_KITS = [
  {
    title: "next-composer",
    description: "A Next.js boilerplate for bolt.new,cursor & v0 developers.",
    tags: ["next.js", "supabase auth", "supabase db", "open ai api", "typescript", "Stripe"],
    youtubeId: "paNnzVPpvaA",
    repoUrl: "https://github.com/bolt-new/next-composer"
  },
  {
    title: "composer-cut",
    description: "A Vite boilerplate that turns UI screenshots into 3D videos",
    tags: ["Vite", "supabase auth", "supabase db", "ffmpeg.wasm"],
    youtubeId: "iVY0-iGSpSM",
    repoUrl: "https://github.com/bolt-new/composer-cut"
  }
]

// Shimmer loading animation
const shimmer = "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent"

export function StarterKits({ onAuthClick }: StarterKitsProps) {
  return (
    <div className="bg-[#0A0A0B]">
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Composer Kits
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Jump-start your development with our pre-built templates
          </p>
          <Button 
            size="lg"
            className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={onAuthClick}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Real starter kits */}
          {STARTER_KITS.map((kit, index) => (
            <div
              key={index}
              className="group rounded-xl border border-[#1F1F21] bg-[#111113] overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                <iframe
                  className="w-full h-full absolute inset-0"
                  src={`https://www.youtube.com/embed/${kit.youtubeId}`}
                  title={kit.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitFork className="h-4 w-4 text-gray-500" />
                    <h3 className="font-medium text-white">{kit.title}</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-md border-[#1F1F21] bg-transparent text-gray-300 hover:bg-[#1F1F21] hover:text-white"
                    onClick={onAuthClick}
                  >
                    Fork Repo
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{kit.description}</p>
                <div className="flex flex-wrap gap-2">
                  {kit.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2.5 py-1 text-xs rounded-md bg-[#1F1F21] text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Coming soon placeholders */}
          {[...Array(4)].map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className={`group rounded-xl border border-[#1F1F21] bg-[#111113] overflow-hidden relative ${shimmer}`}
            >
              <div className="aspect-video bg-[#1F1F21]/50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-3 py-1.5 bg-[#1F1F21] text-gray-400 rounded-full text-sm font-medium">
                    Coming Soon
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-[#1F1F21]" />
                    <div className="h-4 w-24 rounded bg-[#1F1F21]" />
                  </div>
                  <div className="h-7 w-20 rounded-md bg-[#1F1F21]" />
                </div>
                <div className="h-4 w-3/4 rounded bg-[#1F1F21] mb-4" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, tagIndex) => (
                    <div
                      key={tagIndex}
                      className="h-6 w-16 rounded-md bg-[#1F1F21]"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 