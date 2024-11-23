'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  searchCallback?: (query: string) => void;
}

export default function SearchBar({ searchCallback }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchCallback) {
      searchCallback(searchQuery)
    }
    setSearchQuery('')
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search starter kits..." 
        className="pl-10 pr-20 py-4 md:py-6 text-base md:text-lg rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 w-full"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
      <Button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-3 md:px-4 py-1 md:py-2 text-sm md:text-base"
      >
        Search
      </Button>
    </form>
  )
}

