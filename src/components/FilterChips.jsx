import { Utensils, Wine, Coffee, Music, Star, Zap } from 'lucide-react'

const FilterChips = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All', icon: null },
    { id: 'trending', label: 'Trending', icon: Zap },
    { id: 'restaurants', label: 'Food', icon: Utensils },
    { id: 'bars', label: 'Drinks', icon: Wine },
    { id: 'cafes', label: 'Coffee', icon: Coffee },
    { id: 'music', label: 'Live Music', icon: Music },
    { id: 'rated', label: 'Top Rated', icon: Star },
  ]

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
              activeFilter === filter.id
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface/20 text-textSecondary border border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            {filter.icon && <filter.icon className="w-3 h-3" />}
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterChips