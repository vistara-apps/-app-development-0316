import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button
      className={`p-2 rounded-full bg-surface/30 backdrop-blur-sm border border-white/10 hover:bg-surface/50 transition-colors ${className}`}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-blue-400" />
      )}
    </button>
  )
}

export default ThemeToggle

