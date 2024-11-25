import { Button } from '@/components/ui/button'

interface NavBarProps {
  onAuthClick: () => void;
}

export function NavBar({ onAuthClick }: NavBarProps) {
  return (
    <div className="w-full flex justify-center px-4">
      <nav className="flex items-center justify-between p-4 w-full max-w-5xl">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Composers.dev</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            className="hidden md:inline-flex text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={onAuthClick}
          >
            Sign in
          </Button>
          <Button 
            size="sm"
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
            onClick={onAuthClick}
          >
            Get started
          </Button>
        </div>
      </nav>
    </div>
  )
} 