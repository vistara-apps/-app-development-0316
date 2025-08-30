import { Home, MapPin, Heart, Clock, User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: MapPin, label: 'Discover', active: false },
    { icon: Heart, label: 'Favorites', active: false },
    { icon: Clock, label: 'History', active: false },
    { icon: User, label: 'Profile', active: false },
  ]

  const bottomItems = [
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Help' },
    { icon: LogOut, label: 'Logout' },
  ]

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-white/10 z-50">
        <div className="flex justify-around py-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'text-primary'
                  : 'text-textSecondary hover:text-white'
              }`}
              aria-label={item.label}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Desktop sidebar
  return (
    <div className="w-16 md:w-20 bg-surface/30 backdrop-blur-md border-r border-white/10 flex flex-col py-6 h-screen">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm md:text-base">L</span>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1">
        <ul className="space-y-4 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-12 h-12 md:w-16 md:h-16 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                  item.active
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-textSecondary hover:text-white hover:bg-white/10'
                }`}
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs mt-1 hidden md:block">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="px-2">
        <ul className="space-y-4">
          {bottomItems.map((item, index) => (
            <li key={index}>
              <button 
                className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex flex-col items-center justify-center text-textSecondary hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label={item.label}
              >
                <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-xs mt-1 hidden md:block">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
