import { Search, Mic } from 'lucide-react'

const SearchBar = () => {
  return (
    <div className="relative mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-textSecondary" />
        <input
          type="text"
          placeholder="Search restaurants, bars, vibes..."
          className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 pr-12 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
        />
        <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textSecondary hover:text-white transition-colors">
          <Mic className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default SearchBar