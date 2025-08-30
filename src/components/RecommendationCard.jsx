import { Star, TrendingUp, MapPin } from 'lucide-react'

const RecommendationCard = ({ name, type, rating, vibe, image, trending, onClick }) => {
  return (
    <div 
      className="bg-surface/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-accent/30 transition-all duration-200 cursor-pointer hover:bg-surface/40"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Image/Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center text-2xl">
          {image}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-white text-sm">{name}</h4>
            {trending && (
              <TrendingUp className="w-4 h-4 text-yellow-400" />
            )}
          </div>
          
          <p className="text-textSecondary text-xs mb-2">{type}</p>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
              <span className="text-xs text-white font-medium">{rating}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-xs text-textSecondary">{vibe}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendationCard