import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { LogIn, UserPlus, Mail, Lock, Chrome, Scale } from 'lucide-react';

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
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        {/* Auth Form */}
        <Card className="shadow-2xl border border-gray-600 bg-black/50 backdrop-blur-lg text-white" hover>
          <div className="text-center mb-8 animate-slide-up">
            <img
              src="/mediatorai.png"
              alt="MediatorAI Logo"
              className="mx-auto h-20 w-auto mb-4 transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-2">
              <Scale className="h-10 w-10" />
              Welcome to MediatorAI
            </h1>
            <p className="text-white mt-2">Peaceful dispute resolution powered by AI</p>
          </div>
          <div className="flex mb-8 bg-gray-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-white hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-white hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
          <div className="space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2" variant="outline">
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/50 text-white">Or continue with email</span>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                icon={<UserPlus className="h-5 w-5" />}
                className="animate-slide-up"
              />
            )}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              icon={<Mail className="h-5 w-5" />}
              className="animate-slide-up"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              icon={<Lock className="h-5 w-5" />}
              error={error}
              className="animate-slide-up"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-8"
              lift
            >
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