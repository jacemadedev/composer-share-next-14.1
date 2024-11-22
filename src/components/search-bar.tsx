'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
    setSearchQuery('')
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search starter kits and boilerplates..." 
        className="pl-10 pr-20 py-6 text-lg rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 w-full"
      />
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full">
        Search
      </Button>
    </form>
  )
}

