import { Search, Mic, X } from 'lucide-react'
import { useState, useRef } from 'react'

const SearchBar = () => {
  const [searchValue, setSearchValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  
  const handleClear = () => {
    setSearchValue('')
    inputRef.current.focus()
  }
  
  const handleVoiceSearch = () => {
    // This would be implemented with the Web Speech API in a real application
    alert('Voice search activated!')
  }
  
  return (
    <div className="relative mb-6">
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search restaurants, bars, vibes..."
          className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 pr-20 py-2 sm:py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          aria-label="Search for locations"
        />
        
        {/* Clear button - only show when there's text */}
        {searchValue && (
          <button 
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-white transition-colors p-1"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Voice search button */}
        <button 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-white transition-colors p-1"
          onClick={handleVoiceSearch}
          aria-label="Search by voice"
        >
          <Mic className="w-4 h-4" />
        </button>
      </div>
      
      {/* Search suggestions - only show when focused and has input */}
      {isFocused && searchValue && (
        <div className="absolute z-10 mt-1 w-full bg-surface/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg py-2 animate-fadeIn">
          <ul>
            {['Restaurants near me', 'Bars with live music', 'Coffee shops open now'].map((suggestion, index) => (
              <li key={index}>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-white/5 text-sm text-textSecondary hover:text-white transition-colors"
                  onClick={() => setSearchValue(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchBar
