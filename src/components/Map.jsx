import { MapPin, Star, Zap, Plus, Minus, Layers, Navigation, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

const Map = ({ selectedLocation }) => {
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 })
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [showPopup, setShowPopup] = useState(false)
  const [activeLocation, setActiveLocation] = useState(null)
  const mapRef = useRef(null)
  
  // Location data with names and details
  const locations = [
    { id: 'anchor', x: '25%', y: '60%', type: 'restaurant', trending: true, name: 'The Rusty Anchor', rating: '4.9', description: 'Seafood restaurant with waterfront dining' },
    { id: 'neon', x: '65%', y: '40%', type: 'bar', trending: true, name: 'Neon Nights', rating: '4.7', description: 'Cocktail bar with live music' },
    { id: 'garden', x: '45%', y: '70%', type: 'cafe', trending: false, name: 'Garden Cafe', rating: '4.6', description: 'Hidden gem brunch spot' },
    { id: 'spot1', x: '30%', y: '30%', type: 'restaurant', trending: true, name: 'Harvest Table', rating: '4.5', description: 'Farm-to-table dining experience' },
    { id: 'spot2', x: '70%', y: '25%', type: 'bar', trending: false, name: 'The Speakeasy', rating: '4.3', description: 'Craft cocktails in a vintage setting' },
    { id: 'spot3', x: '20%', y: '80%', type: 'cafe', trending: true, name: 'Morning Brew', rating: '4.8', description: 'Artisanal coffee and pastries' },
    { id: 'spot4', x: '80%', y: '60%', type: 'restaurant', trending: false, name: 'Spice Route', rating: '4.4', description: 'Authentic international cuisine' },
    { id: 'spot5', x: '55%', y: '35%', type: 'bar', trending: true, name: 'Skyline Lounge', rating: '4.6', description: 'Rooftop bar with city views' },
    { id: 'spot6', x: '35%', y: '85%', type: 'cafe', trending: false, name: 'Book & Bean', rating: '4.2', description: 'Cozy cafe with reading nooks' },
    { id: 'spot7', x: '75%', y: '80%', type: 'restaurant', trending: true, name: 'Ocean Grill', rating: '4.7', description: 'Fresh seafood with ocean views' },
  ]
  
  // Update active location when selectedLocation changes
  useEffect(() => {
    if (selectedLocation) {
      const location = locations.find(loc => loc.id === selectedLocation)
      if (location) {
        setActiveLocation(location)
        setShowPopup(true)
        
        // Center the map on the selected location
        const x = parseFloat(location.x) / 100
        const y = parseFloat(location.y) / 100
        setMapPosition({
          x: -x * 100 + 50,
          y: -y * 100 + 50
        })
      }
    }
  }, [selectedLocation])

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
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.2, 2))
  }
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.2, 0.5))
  }
  
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setStartDragPosition({
        x: e.clientX - mapPosition.x,
        y: e.clientY - mapPosition.y
      })
    }
  }
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setMapPosition({
        x: e.clientX - startDragPosition.x,
        y: e.clientY - startDragPosition.y
      })
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  const handleTouchStart = (e) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setStartDragPosition({
      x: touch.clientX - mapPosition.x,
      y: touch.clientY - mapPosition.y
    })
  }
  
  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0]
      setMapPosition({
        x: touch.clientX - startDragPosition.x,
        y: touch.clientY - startDragPosition.y
      })
    }
  }
  
  const handleTouchEnd = () => {
    setIsDragging(false)
  }
  
  const handlePinClick = (location) => {
    setActiveLocation(location)
    setShowPopup(true)
  }
  
  const closePopup = (e) => {
    e.stopPropagation()
    setShowPopup(false)
  }
  
  // Reset map position
  const handleResetPosition = () => {
    setMapPosition({ x: 0, y: 0 })
    setZoom(1)
  }

  return (
    <div 
      className="h-full relative overflow-hidden"
      ref={mapRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      role="application"
      aria-label="Interactive map of local venues"
    >
      {/* Map Background with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-800/20 to-pink-700/30 transition-transform duration-300"
        style={{ 
          transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
          transformOrigin: 'center'
        }}
      >
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
        
        {/* Location Pins */}
        {locations.map((location) => (
          <div
            key={location.id}
            className={`absolute map-pin cursor-pointer transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 ${
              activeLocation?.id === location.id ? 'scale-125 z-10' : 'z-0'
            }`}
            style={{
              left: location.x,
              top: location.y,
            }}
            onClick={(e) => {
              e.stopPropagation()
              handlePinClick(location)
            }}
            role="button"
            aria-label={`${location.name}, ${location.type}${location.trending ? ', trending' : ''}`}
            tabIndex={0}
          >
            <div className="relative">
              <MapPin 
                className={`w-8 h-8 ${getMarkerColor(location.type, location.trending)} drop-shadow-lg`}
                fill="currentColor"
              />
              {location.trending && (
                <Zap className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" aria-hidden="true" />
              )}
            </div>
          </div>
        ))}
        
        {/* Current Location Indicator */}
        <div className="absolute bottom-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-lg">
            <div className="w-8 h-8 bg-blue-500/30 rounded-full absolute -inset-2 animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 sm:top-6 right-6 flex flex-col gap-2 z-20">
        <button 
          className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <Plus size={20} />
        </button>
        <button 
          className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <Minus size={20} />
        </button>
        <button 
          className="w-10 h-10 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-surface/60 transition-colors"
          onClick={handleResetPosition}
          aria-label="Reset map position"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Legend - Hide on small screens */}
      <div className="hidden sm:block absolute bottom-6 right-6 bg-surface/40 backdrop-blur-sm rounded-lg border border-white/20 p-4 z-20">
        <h4 className="text-sm font-semibold text-white mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-400" fill="currentColor" aria-hidden="true" />
            <span className="text-xs text-textSecondary">Trending</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" fill="currentColor" aria-hidden="true" />
            <span className="text-xs text-textSecondary">Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" fill="currentColor" aria-hidden="true" />
            <span className="text-xs text-textSecondary">Bars</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" fill="currentColor" aria-hidden="true" />
            <span className="text-xs text-textSecondary">Cafes</span>
          </div>
        </div>
      </div>
      
      {/* Location Popup */}
      {showPopup && activeLocation && (
        <div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xs bg-surface/90 backdrop-blur-md rounded-lg border border-white/20 p-4 z-30 shadow-lg animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="absolute top-2 right-2 text-textSecondary hover:text-white transition-colors"
            onClick={closePopup}
            aria-label="Close popup"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center text-2xl">
              {activeLocation.type === 'restaurant' ? '🍽️' : activeLocation.type === 'bar' ? '🍸' : '☕'}
            </div>
            
            <div>
              <h3 className="font-semibold text-white">{activeLocation.name}</h3>
              <p className="text-xs text-textSecondary">{activeLocation.type.charAt(0).toUpperCase() + activeLocation.type.slice(1)}</p>
            </div>
          </div>
          
          <p className="text-sm text-textSecondary mb-3">{activeLocation.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" aria-hidden="true" />
              <span className="text-sm text-white font-medium">{activeLocation.rating}</span>
            </div>
            
            <span className="text-xs text-textSecondary">0.8 mi away</span>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent/90 transition-colors">
              Directions
            </button>
            <button className="flex-1 py-2 bg-surface/50 text-white text-sm font-medium rounded-md border border-white/10 hover:bg-surface/70 transition-colors">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Map
