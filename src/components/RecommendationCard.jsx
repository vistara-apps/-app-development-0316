import { Star, TrendingUp, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const RecommendationCard = ({ name, type, rating, vibe, image, trending, onClick }) => {
  const [expanded, setExpanded] = useState(false)
  
  const handleClick = (e) => {
    onClick && onClick(e)
  }
  
  const toggleExpand = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }
  
  return (
    <div 
      className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/10 hover:border-accent/30 transition-all duration-200 cursor-pointer hover:bg-surface/40"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}, ${type}, rated ${rating} stars`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e)
        }
      }}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Image/Icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center text-xl sm:text-2xl">
          {image}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white text-sm">{name}</h4>
            <div className="flex items-center gap-1">
              {trending && (
                <TrendingUp className="w-4 h-4 text-yellow-400" aria-label="Trending location" />
              )}
              <button 
                className="p-1 text-textSecondary hover:text-white transition-colors"
                onClick={toggleExpand}
                aria-label={expanded ? "Show less details" : "Show more details"}
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
          
          <p className="text-textSecondary text-xs mb-2">{type}</p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" aria-label={`Rating: ${rating} stars`}>
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
              <span className="text-xs text-white font-medium">{rating}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-xs text-textSecondary">{vibe}</span>
            </div>
          </div>
          
          {/* Expanded content */}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-textSecondary">Price Range</p>
                  <p className="text-white">$$</p>
                </div>
                <div>
                  <p className="text-textSecondary">Distance</p>
                  <p className="text-white">0.8 mi</p>
                </div>
                <div>
                  <p className="text-textSecondary">Hours</p>
                  <p className="text-white">Open until 10PM</p>
                </div>
                <div>
                  <p className="text-textSecondary">Popular Times</p>
                  <p className="text-accent">Not busy</p>
                </div>
              </div>
              <button 
                className="w-full mt-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent text-xs font-medium rounded-md transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  // Add favorite functionality here
                }}
                aria-label={`Save ${name} to favorites`}
              >
                Save to Favorites
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard
