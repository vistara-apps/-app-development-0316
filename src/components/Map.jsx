import { useState, useEffect } from 'react'
import { MapPin, Star, Zap, Info } from 'lucide-react'

const Map = ({ selectedLocation, locations = [] }) => {
  const [mapLocations, setMapLocations] = useState([])
  const [zoom, setZoom] = useState(1)
  const [showInfo, setShowInfo] = useState(null)
  
  // Process locations to add x/y coordinates if not provided
  useEffect(() => {
    if (!locations || locations.length === 0) {
      setMapLocations([])
      return
    }
    
    // If locations have latitude/longitude, convert to x/y for the map
    // Otherwise, generate random positions
    const processedLocations = locations.map(location => {
      // If location already has x/y, use those
      if (location.x && location.y) {
        return location
      }
      
      // If location has latitude/longitude, convert to x/y
      // This is a simplified conversion for demo purposes
      if (location.latitude && location.longitude) {
        // Simple mapping to x/y coordinates (this would be more complex in a real app)
        // For demo, just use a simple algorithm to distribute points
        const x = `${((location.longitude % 1) * 100).toFixed(2)}%`
        const y = `${((location.latitude % 1) * 100).toFixed(2)}%`
        return { ...location, x, y }
      }
      
      // Otherwise, generate random position
      return {
        ...location,
        x: `${Math.floor(20 + Math.random() * 60)}%`,
        y: `${Math.floor(20 + Math.random() * 60)}%`
      }
    })
    
    setMapLocations(processedLocations)
  }, [locations])

  const getMarkerColor = (type, trending) => {
    if (trending) {
      return 'text-yellow-400 glow'
    }
    
    const typeStr = type?.toLowerCase() || ''
    
    if (typeStr.includes('restaurant') || typeStr.includes('food')) {
      return 'text-orange-400'
    } else if (typeStr.includes('bar') || typeStr.includes('pub') || typeStr.includes('club')) {
      return 'text-purple-400'
    } else if (typeStr.includes('cafe') || typeStr.includes('coffee')) {
      return 'text-green-400'
    } else if (typeStr.includes('event') || typeStr.includes('venue')) {
      return 'text-pink-400'
    } else if (typeStr.includes('shop') || typeStr.includes('store')) {
      return 'text-blue-400'
    }
    
    return 'text-blue-400'
  }
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2))
  }
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.6))
  }
  
  const handlePinClick = (location) => {
    setShowInfo(location.id === showInfo ? null : location.id)
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Map Background with Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-800/20 to-pink-700/30">
        {/* City Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10 origin-center transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg width="100%" height="100%" className="text-white">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map Roads/Streets */}
        <div 
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Horizontal streets */}
          <div className="absolute top-1/4 left-0 w-full h-0.5 bg-white/20"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20"></div>
          <div className="absolute top-3/4 left-0 w-full h-0.5 bg-white/20"></div>
          
          {/* Vertical streets */}
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-white/20"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/20"></div>
          <div className="absolute top-0 left-3/4 w-0.5 h-full bg-white/20"></div>
        </div>
      </div>

      {/* Location Pins */}
      {mapLocations.map((location) => (
        <div
          key={location.id}
          className={`absolute map-pin cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 ${
            selectedLocation === location.id ? 'scale-125 z-10' : 'z-0'
          }`}
          style={{
            left: location.x,
            top: location.y,
          }}
          onClick={() => handlePinClick(location)}
        >
          <div className="relative">
            <MapPin 
              className={`w-8 h-8 ${getMarkerColor(location.type, location.trending)} drop-shadow-lg`}
              fill="currentColor"
            />
            {location.trending && (
              <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            )}
            
            {/* Info popup */}
            {showInfo === location.id && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-surface/80 backdrop-blur-md rounded-lg border border-white/20 p-3 shadow-lg z-20">
                <h4 className="font-semibold text-white text-sm">{location.name}</h4>
                <p className="text-xs text-textSecondary mb-1">{location.type}</p>
                {location.rating && (
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                    <span className="text-xs text-white">{location.rating}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors"
        >
          <span className="text-xl font-light">+</span>
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors"
        >
          <span className="text-xl font-light">−</span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 right-6 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 p-4">
        <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" fill="currentColor" />
            <span className="text-xs text-textSecondary">Trending</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" fill="currentColor" />
            <span className="text-xs text-textSecondary">Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" fill="currentColor" />
            <span className="text-xs text-textSecondary">Bars</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" fill="currentColor" />
            <span className="text-xs text-textSecondary">Cafes</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-pink-400" fill="currentColor" />
            <span className="text-xs text-textSecondary">Events</span>
          </div>
        </div>
      </div>

      {/* Current Location Indicator */}
      <div className="absolute bottom-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-lg">
          <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute -inset-2 animate-ping"></div>
        </div>
      </div>
      
      {/* Empty State */}
      {mapLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-surface/40 backdrop-blur-md rounded-lg border border-white/20 p-6 max-w-xs text-center">
            <Info className="w-10 h-10 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">No Locations Found</h3>
            <p className="text-sm text-textSecondary">
              Try searching for a different location or refreshing the data.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Map
