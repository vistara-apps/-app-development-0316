import { useState, useEffect, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import Map from './components/Map'
import RecommendationCard from './components/RecommendationCard'
import SearchBar from './components/SearchBar'
import FilterChips from './components/FilterChips'
import LoadingSpinner from './components/LoadingSpinner'
import ThemeToggle from './components/ThemeToggle'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Globe, Settings, Bell, User, Menu, X, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useTheme } from './contexts/ThemeContext'
import { useToast } from './contexts/ToastContext'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showPanel, setShowPanel] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()
  const toast = useToast()
  
  // Check if the screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setShowSidebar(false)
        setShowPanel(false)
      } else if (window.innerWidth < 1024) {
        setShowSidebar(true)
        setShowPanel(false)
      } else {
        setShowSidebar(true)
        setShowPanel(true)
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])
  
  // Show welcome toast on first load
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setTimeout(() => {
        toast.info('Welcome to LocalVibe AI! Discover trending spots near you.', { duration: 5000 })
        localStorage.setItem('hasSeenWelcome', 'true')
      }, 1000)
    }
  }, [toast])
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }
  
  // Toggle panel visibility
  const togglePanel = () => {
    setShowPanel(!showPanel)
  }
  
  // Simulate loading when changing filters
  const handleFilterChange = (filterId) => {
    setIsLoading(true)
    setActiveFilter(filterId)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast.success(`Showing ${filterId} locations`, { duration: 2000 })
    }, 800)
  }
  
  // Handle location selection
  const handleLocationSelect = (locationId) => {
    setSelectedLocation(locationId)
    if (isMobile) setShowPanel(false)
    
    // Show toast for selection
    toast.info('Location details loaded', { duration: 2000 })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      theme === 'dark' 
        ? 'from-blue-800 via-purple-700 to-pink-600' 
        : 'from-blue-400 via-purple-300 to-pink-300'
    } text-white`}>
      <div className="flex flex-col md:flex-row relative">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden absolute top-4 left-4 z-50 bg-surface/40 backdrop-blur-sm p-2 rounded-lg"
          onClick={toggleSidebar}
          aria-label={showSidebar ? "Close sidebar" : "Open sidebar"}
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-20">
          <ThemeToggle />
        </div>
        
        {/* Sidebar */}
        <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out 
          fixed md:relative z-40 h-full md:h-auto`}>
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Panel */}
          <div className={`${showPanel ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 lg:opacity-0'} 
            transition-all duration-300 ease-in-out
            w-full lg:w-80 bg-surface/20 backdrop-blur-md border-r border-white/10 p-4 md:p-6
            fixed lg:relative z-30 h-full lg:h-auto overflow-y-auto`}>
            
            {/* Panel Toggle Button (visible on large screens) */}
            <button 
              className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 bg-surface/40 backdrop-blur-sm p-1 rounded-full border border-white/10 z-10"
              onClick={togglePanel}
              aria-label={showPanel ? "Hide panel" : "Show panel"}
            >
              {showPanel ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 mt-12 md:mt-0">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-accent" />
                <span className="text-sm text-textSecondary">San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <Settings className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <div className="hidden sm:block">
                  <ConnectButton />
                </div>
              </div>
            </div>

            {/* Search */}
            <SearchBar />

            {/* Filter Chips */}
            <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                <div className="text-xl md:text-2xl font-bold text-white">24</div>
                <div className="text-xs text-textSecondary">Trending</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                <div className="text-xl md:text-2xl font-bold text-accent">12.5k</div>
                <div className="text-xs text-textSecondary">Reviews</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-2 md:p-3 border border-white/10">
                <div className="text-xl md:text-2xl font-bold text-pink-400">4.8</div>
                <div className="text-xs text-textSecondary">Rating</div>
              </div>
            </div>

            {/* Recommendations List with Loading State */}
            <div className="space-y-4 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Trending Near You</h3>
                {isLoading && <LoadingSpinner size="sm" />}
              </div>
              
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-surface/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 h-24" />
                  ))}
                </div>
              ) : (
                <>
                  <RecommendationCard
                    name="The Rusty Anchor"
                    type="Seafood Restaurant"
                    rating="4.9"
                    vibe="Waterfront dining"
                    image="🦞"
                    trending={true}
                    onClick={() => handleLocationSelect('anchor')}
                  />
                  
                  <RecommendationCard
                    name="Neon Nights"
                    type="Cocktail Bar"
                    rating="4.7"
                    vibe="Live music"
                    image="🍸"
                    trending={true}
                    onClick={() => handleLocationSelect('neon')}
                  />
                  
                  <RecommendationCard
                    name="Garden Cafe"
                    type="Brunch Spot"
                    rating="4.6"
                    vibe="Hidden gem"
                    image="🌿"
                    trending={false}
                    onClick={() => handleLocationSelect('garden')}
                  />
                </>
              )}
              
              {/* Get More Button */}
              <button 
                className="w-full py-3 mt-2 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium rounded-lg border border-primary/30 transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  setIsLoading(true)
                  setTimeout(() => {
                    setIsLoading(false)
                    toast.info('This feature requires a micro-transaction of $0.10', { 
                      duration: 5000,
                      position: 'top-center'
                    })
                  }, 800)
                }}
              >
                <Info size={16} />
                Get More Vibes ($0.10)
              </button>
            </div>
          </div>

          {/* Map Panel */}
          <div className="flex-1 relative h-screen lg:h-auto">
            {/* Mobile Panel Toggle Button */}
            <button 
              className="lg:hidden absolute top-4 right-4 z-30 bg-surface/40 backdrop-blur-sm p-2 rounded-lg"
              onClick={togglePanel}
              aria-label={showPanel ? "Hide panel" : "Show panel"}
            >
              {showPanel ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Connect Button for Mobile */}
            <div className="sm:hidden absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <ConnectButton />
            </div>
            
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
              <Map selectedLocation={selectedLocation} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
