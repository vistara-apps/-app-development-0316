import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Map from './components/Map'
import RecommendationCard from './components/RecommendationCard'
import SearchBar from './components/SearchBar'
import FilterChips from './components/FilterChips'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Globe, Settings, Bell, User, Menu } from 'lucide-react'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

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
                <span className="text-sm text-textSecondary">San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <Settings className="w-5 h-5 text-textSecondary cursor-pointer hover:text-white" />
                <ConnectButton />
              </div>
            </div>

            {/* Search */}
            <SearchBar />

            {/* Filter Chips */}
            <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-white">24</div>
                <div className="text-xs text-textSecondary">Trending</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-accent">12.5k</div>
                <div className="text-xs text-textSecondary">Reviews</div>
              </div>
              <div className="bg-surface/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                <div className="text-2xl font-bold text-pink-400">4.8</div>
                <div className="text-xs text-textSecondary">Rating</div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Trending Near You</h3>
              
              <RecommendationCard
                name="The Rusty Anchor"
                type="Seafood Restaurant"
                rating="4.9"
                vibe="Waterfront dining"
                image="🦞"
                trending={true}
                onClick={() => setSelectedLocation('anchor')}
              />
              
              <RecommendationCard
                name="Neon Nights"
                type="Cocktail Bar"
                rating="4.7"
                vibe="Live music"
                image="🍸"
                trending={true}
                onClick={() => setSelectedLocation('neon')}
              />
              
              <RecommendationCard
                name="Garden Cafe"
                type="Brunch Spot"
                rating="4.6"
                vibe="Hidden gem"
                image="🌿"
                trending={false}
                onClick={() => setSelectedLocation('garden')}
              />
            </div>
          </div>

          {/* Map Panel */}
          <div className="flex-1 relative">
            <Map selectedLocation={selectedLocation} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App