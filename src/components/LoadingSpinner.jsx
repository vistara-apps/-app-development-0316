import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'accent', fullScreen = false }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }
  
  // Color classes
  const colorClasses = {
    accent: 'border-accent/30 border-t-accent',
    primary: 'border-primary/30 border-t-primary',
    white: 'border-white/30 border-t-white',
  }
  
  // Container classes for fullScreen mode
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-50'
    : ''
  
  const spinner = (
    <div 
      className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.accent} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  )
  
  return fullScreen ? (
    <div className={containerClasses}>
      {spinner}
    </div>
  ) : spinner
}

export default LoadingSpinner

