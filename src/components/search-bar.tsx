'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => Promise<void> | void;
}

export default function SearchBar({ onSearch, placeholder = "Search..." }: SearchBarProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>()

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setIsSearching(true)

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Set new timeout for debouncing
    const timeout = setTimeout(async () => {
      if (onSearch) {
        await onSearch(query)
      }
      setIsSearching(false)
    }, 300)

    setSearchTimeout(timeout)
  }, [onSearch, searchTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pl-10 pr-20 py-4 md:py-6 text-base md:text-lg rounded-full shadow-sm focus:ring-2 focus:ring-blue-500 w-full"
        aria-label="Search input"
        disabled={isSearching}
      />
    </div>
  )
}

