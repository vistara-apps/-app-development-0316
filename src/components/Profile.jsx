import { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { User, Mail, MapPin, Settings, Heart, Clock, LogOut, Save, Loader } from 'lucide-react';

const Profile = () => {
  const { user, getProfile, updateProfile, signOut, getUserFavorites, getUserHistory } = useSupabase();
  
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');
  
  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const profileData = await getProfile();
        setProfile(profileData);
        
        // Set form values
        setFullName(profileData?.full_name || '');
        setUsername(profileData?.username || '');
        setLocation(profileData?.location || '');
        
        // Fetch favorites and history
        if (activeTab === 'favorites') {
          const favoritesData = await getUserFavorites(user.id);
          setFavorites(favoritesData);
        } else if (activeTab === 'history') {
          const historyData = await getUserHistory(user.id);
          setHistory(historyData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserData();
    }
  }, [user, getProfile, getUserFavorites, getUserHistory, activeTab]);
  
  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setMessage(null);
      
      const updates = {
        full_name: fullName,
        username,
        location,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await updateProfile(updates);
      
      if (error) throw error;
      
      setMessage('Profile updated successfully!');
      setProfile({ ...profile, ...updates });
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-surface/30 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-white border-b-2 border-accent'
              : 'text-textSecondary hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-white border-b-2 border-accent'
              : 'text-textSecondary hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorites
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-white border-b-2 border-accent'
              : 'text-textSecondary hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          History
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-white border-b-2 border-accent'
              : 'text-textSecondary hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
      
      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-sm text-green-200">{message}</p>
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white/70 focus:outline-none transition-colors"
                  />
                </div>
                <p className="mt-1 text-xs text-textSecondary">Email cannot be changed</p>
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-textSecondary mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-textSecondary mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-textSecondary mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Your city or location"
                    className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-surface/40 hover:bg-surface/60 text-textSecondary hover:text-white rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent/80 text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Favorites</h3>
            
            {favorites.length === 0 ? (
              <div className="text-center py-8 bg-surface/20 rounded-lg border border-white/10">
                <Heart className="w-12 h-12 text-textSecondary mx-auto mb-3" />
                <p className="text-textSecondary">You haven't saved any favorites yet.</p>
                <p className="text-xs text-textSecondary mt-1">
                  Explore recommendations and save your favorite places!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="p-4 bg-surface/20 rounded-lg border border-white/10 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center text-xl">
                        {getEmojiForType(favorite.location?.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{favorite.location?.name}</h4>
                        <p className="text-textSecondary text-xs">{favorite.location?.type}</p>
                        {favorite.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
                            <span className="text-xs text-white">{favorite.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recently Viewed</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-8 bg-surface/20 rounded-lg border border-white/10">
                <Clock className="w-12 h-12 text-textSecondary mx-auto mb-3" />
                <p className="text-textSecondary">Your history is empty.</p>
                <p className="text-xs text-textSecondary mt-1">
                  Places you view will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-surface/20 rounded-lg border border-white/10 hover:border-accent/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center text-xl">
                        {getEmojiForType(item.location?.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{item.location?.name}</h4>
                        <p className="text-textSecondary text-xs">{item.location?.type}</p>
                        <p className="text-xs text-textSecondary mt-1">
                          Viewed {formatDate(item.viewed_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-surface/20 rounded-lg border border-white/10">
                <h4 className="font-medium text-white mb-2">Notifications</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textSecondary">Email notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
              
              <div className="p-4 bg-surface/20 rounded-lg border border-white/10">
                <h4 className="font-medium text-white mb-2">Privacy</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-textSecondary">Share my activity</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
              </div>
              
              <div className="p-4 bg-surface/20 rounded-lg border border-white/10">
                <h4 className="font-medium text-white mb-2">Theme</h4>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button className="h-8 rounded-md bg-gradient-to-br from-blue-800 via-purple-700 to-pink-600 border-2 border-white"></button>
                  <button className="h-8 rounded-md bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border border-white/20"></button>
                  <button className="h-8 rounded-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 border border-white/20"></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to get emoji for type
const getEmojiForType = (type) => {
  switch (type?.toLowerCase()) {
    case 'restaurant':
      return '🍽️';
    case 'bar':
      return '🍸';
    case 'cafe':
      return '☕';
    case 'brunch spot':
      return '🥞';
    case 'bakery':
      return '🥐';
    case 'dessert':
      return '🍰';
    case 'food truck':
      return '🚚';
    case 'pub':
      return '🍺';
    case 'club':
      return '🎵';
    case 'event':
      return '🎭';
    default:
      return '📍';
  }
};

export default Profile;

