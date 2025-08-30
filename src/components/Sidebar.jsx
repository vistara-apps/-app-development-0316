import { Home, MapPin, Heart, Clock, User, Settings, HelpCircle, LogOut } from 'lucide-react'

const Sidebar = () => {
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

  return (
    <div className="w-16 bg-surface/30 backdrop-blur-md border-r border-white/10 flex flex-col py-6">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-accent to-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  item.active
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-textSecondary hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="px-2">
        <ul className="space-y-2">
          {bottomItems.map((item, index) => (
            <li key={index}>
              <button className="w-12 h-12 rounded-lg flex items-center justify-center text-textSecondary hover:text-white hover:bg-white/10 transition-all duration-200">
                <item.icon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Sidebar