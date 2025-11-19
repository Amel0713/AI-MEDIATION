import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { LogIn, UserPlus, Mail, Lock } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
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


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50 to-primary-100 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        {/* Auth Form */}
        <Card className="shadow-2xl border border-neutral-200/50 bg-white/95 backdrop-blur-lg" hover>
          <div className="text-center mb-8 animate-slide-up">
            <img
              src="/mediatorai.png"
              alt="MediatorAI Logo"
              className="mx-auto h-20 w-auto mb-4 transition-transform duration-300 hover:scale-105"
            />
            <h1 className="text-2xl font-bold text-neutral-900">Welcome to MediatorAI</h1>
            <p className="text-neutral-600 mt-2">Peaceful dispute resolution powered by AI</p>
          </div>
          <div className="flex mb-8 bg-neutral-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 text-center font-semibold rounded-lg transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Sign Up
            </button>
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