import { useState } from 'react'
import { Search, Mic, X } from 'lucide-react'

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch?.(query.trim())
    }
  }
  
  // Clear search query
  const handleClear = () => {
    setQuery('')
    // If there was a previous search, reset to default
    if (query.trim()) {
      onSearch?.('')
    }
  }
  
  // Handle voice search (mock implementation)
  const handleVoiceSearch = () => {
    // In a real app, this would use the Web Speech API
    setIsListening(true)
    
    // Mock voice recognition
    setTimeout(() => {
      const mockResults = [
        'restaurants in San Francisco',
        'coffee shops near me',
        'trending bars downtown',
        'best brunch spots'
      ]
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setQuery(randomResult)
      onSearch?.(randomResult)
      setIsListening(false)
    }, 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants, bars, vibes..."
          className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
        />
        
        {/* Show clear button when there's text */}
        {query && (
          <button 
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Voice search button */}
        <button 
          type="button"
          onClick={handleVoiceSearch}
          disabled={isListening}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
            isListening 
              ? 'text-accent animate-pulse' 
              : 'text-textSecondary hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
      
      {/* Voice listening indicator */}
      {isListening && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-accent animate-pulse">Listening...</span>
        </div>
      )}
    </form>
  )
}

export default SearchBar
