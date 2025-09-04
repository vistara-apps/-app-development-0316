import { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';

const Auth = ({ onSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const { signIn, signUp } = useSupabase();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    try {
      if (mode === 'signin') {
        const { session, error } = await signIn(email, password);
        if (error) throw error;
        if (session) {
          setMessage('Sign in successful!');
          onSuccess?.(session);
        }
      } else {
        const { session, error } = await signUp(email, password, {
          full_name: fullName,
        });
        if (error) throw error;
        
        if (session) {
          setMessage('Sign up successful!');
          onSuccess?.(session);
        } else {
          setMessage('Please check your email for a confirmation link.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-surface/30 backdrop-blur-md rounded-lg border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </h2>
      
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
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
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
                required={mode === 'signup'}
                className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              className="w-full bg-surface/30 backdrop-blur-sm border border-white/10 rounded-lg pl-10 py-3 text-white placeholder-textSecondary focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/80 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          className="text-sm text-textSecondary hover:text-white transition-colors"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;

