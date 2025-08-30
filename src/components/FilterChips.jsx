import { Utensils, Wine, Coffee, Music, Star, Zap, Filter } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const FilterChips = ({ activeFilter, onFilterChange }) => {
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const filtersRef = useRef(null)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])
  
  const filters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'trending', label: 'Trending', icon: Zap },
    { id: 'restaurants', label: 'Food', icon: Utensils },
    { id: 'bars', label: 'Drinks', icon: Wine },
    { id: 'cafes', label: 'Coffee', icon: Coffee },
    { id: 'music', label: 'Live Music', icon: Music },
    { id: 'rated', label: 'Top Rated', icon: Star },
  ]
  
  // For mobile, show only a few filters by default
  const visibleFilters = isMobile && !showAllFilters ? filters.slice(0, 3) : filters
  
  // Handle click outside to close expanded filters
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowAllFilters(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="mb-6" ref={filtersRef}>
      <div className="flex flex-wrap gap-2 items-center">
        {visibleFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              activeFilter === filter.id
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface/20 text-textSecondary border border-white/10 hover:text-white hover:border-white/20'
            }`}
            aria-label={`Filter by ${filter.label}`}
          >
            {filter.icon && <filter.icon className="w-3 h-3" />}
            <span className="truncate max-w-[80px] sm:max-w-none">{filter.label}</span>
          </button>
        ))}
        
        {/* Show more/less button on mobile */}
        {isMobile && (
          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-surface/30 text-textSecondary border border-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
            aria-label={showAllFilters ? "Show fewer filters" : "Show more filters"}
          >
            <Filter className="w-3 h-3" />
            <span>{showAllFilters ? "Less" : "More"}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterChips
