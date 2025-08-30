import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer } from '../components/Toast'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  
  // Add a new toast
  const addToast = useCallback((message, options = {}) => {
    const id = Date.now().toString()
    const newToast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      position: options.position || 'bottom-center'
    }
    
    setToasts(prevToasts => [...prevToasts, newToast])
    return id
  }, [])
  
  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
  }, [])
  
  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success' })
  }, [addToast])
  
  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error' })
  }, [addToast])
  
  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning' })
  }, [addToast])
  
  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info' })
  }, [addToast])
  
  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastContext

