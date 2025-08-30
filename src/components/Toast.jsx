import React, { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'bottom-center'
}) => {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose && onClose()
      }, 300) // Wait for fade out animation
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  // Icon based on type
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-accent" />
  }
  
  // Background color based on type
  const bgColors = {
    success: 'bg-green-400/10 border-green-400/30',
    error: 'bg-red-400/10 border-red-400/30',
    warning: 'bg-yellow-400/10 border-yellow-400/30',
    info: 'bg-accent/10 border-accent/30'
  }
  
  // Position classes
  const positionClasses = {
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }
  
  return (
    <div 
      className={`fixed ${positionClasses[position]} z-50 transform transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg backdrop-blur-md border ${bgColors[type]} shadow-lg max-w-md`}>
        {icons[type]}
        <p className="text-sm text-white">{message}</p>
        <button 
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose && onClose(), 300)
          }}
          className="text-textSecondary hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}

export default Toast

