import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { LogIn, UserPlus, Mail, Lock, Chrome } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // OAuth will redirect, so no need to navigate here
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Auth Form */}
        <Card className="shadow-2xl border border-gray-200 rounded-xl bg-white/90 backdrop-blur-sm">
          <div className="text-center mb-6">
            <img src="/mediatorai.png" alt="MediatorAI Logo" className="mx-auto h-16 w-auto" />
          </div>
          <div className="flex mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center font-medium ${isLogin ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center font-medium ${!isLogin ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500'}`}
            >
              Sign Up
            </button>
          </div>
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mb-6 flex items-center justify-center gap-2">
            <Chrome className="h-5 w-5" />
            Continue with Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-500">Or continue with email</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10"
                />
                <UserPlus className="absolute left-3 top-9 h-5 w-5 text-secondary-400" />
              </div>
            )}
            <div className="relative">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="pl-10"
              />
              <Mail className="absolute left-3 top-9 h-5 w-5 text-secondary-400" />
            </div>
            <div className="relative">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pl-10"
              />
              <Lock className="absolute left-3 top-9 h-5 w-5 text-secondary-400" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;