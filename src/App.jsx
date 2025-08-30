import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Map from './components/Map'
import RecommendationCard from './components/RecommendationCard'
import SearchBar from './components/SearchBar'
import FilterChips from './components/FilterChips'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Globe, Settings, Bell, User, Menu, RefreshCw } from 'lucide-react'
import useRecommendations from './hooks/useRecommendations'
import useSupabase from './hooks/useSupabase'
import useNeynar from './hooks/useNeynar'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [userLocation, setUserLocation] = useState('San Francisco, CA')
  const [refreshing, setRefreshing] = useState(false)
  
  // Get recommendations using our custom hook
  const { 
    recommendations, 
    loading, 
    error, 
    fetchRecommendations,
    processNewRecommendations,
    updateFilters
  } = useRecommendations({
    autoFetch: true,
    type: activeFilter !== 'all' ? activeFilter : null,
    trending: null,
    limit: 20
  })
  
  // Get user from Supabase
  const { user } = useSupabase()
  
  // Handle filter changes
  useEffect(() => {
    updateFilters({
      type: activeFilter !== 'all' ? activeFilter : null
    })
  }, [activeFilter, updateFilters])
  
  // Handle location selection
  const handleSelectLocation = (locationId) => {
    setSelectedLocation(locationId)
  }
  
  // Refresh recommendations
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await processNewRecommendations({
        location: userLocation,
        keywords: ['restaurant', 'bar', 'cafe', 'food', 'drink']
      })
    } catch (error) {
      console.error('Error refreshing recommendations:', error)
    } finally {
      setRefreshing(false)
    }
  }
  
  // Get emoji for recommendation type
  const getEmojiForType = (type) => {
    switch (type?.toLowerCase()) {
      case 'restaurant':
        return '🍽️'
      case 'bar':
        return '🍸'
      case 'cafe':
        return '☕'
      case 'brunch spot':
        return '🥞'
      case 'bakery':
        return '🥐'
      case 'dessert':
        return '🍰'
      case 'food truck':
        return '🚚'
      case 'pub':
        return '🍺'
      case 'club':
        return '🎵'
      case 'event':
        return '🎭'
      default:
        return '📍'
    }
  }
  
  // Calculate stats
  const stats = {
    trending: recommendations.filter(rec => rec.trending).length,
    total: recommendations.length,
    avgRating: recommendations.length > 0 
      ? (recommendations.reduce((sum, rec) => sum + (rec.rating || 0), 0) / recommendations.length).toFixed(1)
      : '0.0'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 text-white">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className="w-80 bg-surface/20 backdrop-blur-md border-r border-white/10 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-accent" />
                <span className="text-sm text-textSecondary">{userLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="text-textSecondary hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <Bell className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <Settings className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <ConnectButton />
              </div>
            </div>

            {/* Search */}
            <SearchBar onSearch={(query) => setUserLocation(query)} />

            {/* Filter Chips */}
            <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-white">{stats.trending}</div>
                <div className="text-xs text-textSecondary">Trending</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-accent">{stats.total}</div>
                <div className="text-xs text-textSecondary">Places</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-pink-400">{stats.avgRating}</div>
                <div className="text-xs text-textSecondary">Avg Rating</div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {activeFilter === 'all' ? 'Trending Near You' : `${activeFilter} Spots`}
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-textSecondary">Loading recommendations...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400">Error loading recommendations</p>
                  <button 
                    onClick={() => fetchRecommendations()} 
                    className="mt-2 px-4 py-2 bg-surface/40 rounded-lg hover:bg-surface/60 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-textSecondary">No recommendations found</p>
                  <button 
                    onClick={handleRefresh} 
                    className="mt-2 px-4 py-2 bg-surface/40 rounded-lg hover:bg-surface/60 transition-colors"
                  >
                    Refresh Data
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      name={recommendation.location?.name || recommendation.title}
                      type={recommendation.location?.type || ''}
                      rating={recommendation.rating?.toString() || ''}
                      vibe={recommendation.vibe || ''}
                      image={getEmojiForType(recommendation.location?.type)}
                      trending={recommendation.trending}
                      onClick={() => handleSelectLocation(recommendation.location?.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map Panel */}
          <div className="flex-1 relative">
            <Map 
              selectedLocation={selectedLocation} 
              locations={recommendations.map(rec => ({
                id: rec.location?.id,
                name: rec.location?.name,
                type: rec.location?.type,
                latitude: rec.location?.latitude,
                longitude: rec.location?.longitude,
                trending: rec.trending
              }))} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
