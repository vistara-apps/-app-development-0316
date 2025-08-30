import { MapPin, Star, Zap } from 'lucide-react'

const Map = ({ selectedLocation }) => {
  const locations = [
    { id: 'anchor', x: '25%', y: '60%', type: 'restaurant', trending: true },
    { id: 'neon', x: '65%', y: '40%', type: 'bar', trending: true },
    { id: 'garden', x: '45%', y: '70%', type: 'cafe', trending: false },
    { id: 'spot1', x: '30%', y: '30%', type: 'restaurant', trending: true },
    { id: 'spot2', x: '70%', y: '25%', type: 'bar', trending: false },
    { id: 'spot3', x: '20%', y: '80%', type: 'cafe', trending: true },
    { id: 'spot4', x: '80%', y: '60%', type: 'restaurant', trending: false },
    { id: 'spot5', x: '55%', y: '35%', type: 'bar', trending: true },
    { id: 'spot6', x: '35%', y: '85%', type: 'cafe', trending: false },
    { id: 'spot7', x: '75%', y: '80%', type: 'restaurant', trending: true },
  ]

  const getMarkerColor = (type, trending) => {
    if (trending) {
      return 'text-yellow-400 glow'
    }
    switch (type) {
      case 'restaurant': return 'text-orange-400'
      case 'bar': return 'text-purple-400'
      case 'cafe': return 'text-green-400'
      default: return 'text-blue-400'
    }
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Map Background with Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-800/20 to-pink-700/30">
        {/* City Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
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
        <div className="absolute inset-0">
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
      {locations.map((location) => (
        <div
          key={location.id}
          className={`absolute map-pin cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 ${
            selectedLocation === location.id ? 'scale-125 z-10' : 'z-0'
          }`}
          style={{
            left: location.x,
            top: location.y,
          }}
        >
          <div className="relative">
            <MapPin 
              className={`w-8 h-8 ${getMarkerColor(location.type, location.trending)} drop-shadow-lg`}
              fill="currentColor"
            />
            {location.trending && (
              <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            )}
          </div>
        </div>
      ))}

      {/* Map Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2">
        <button className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors">
          <span className="text-xl font-light">+</span>
        </button>
        <button className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors">
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
        </div>
      </div>

      {/* Current Location Indicator */}
      <div className="absolute bottom-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-lg">
          <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute -inset-2 animate-ping"></div>
        </div>
      </div>
    </div>
  )
}

export default Map