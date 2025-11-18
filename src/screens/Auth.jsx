import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
           {!isLogin && (
             <Input
               label="Full Name"
               type="text"
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               required
             />
           )}
           <Input
             label="Email address"
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             required
           />
           <Input
             label="Password"
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />
           {error && <p className="text-red-600 text-sm">{error}</p>}
           <Button type="submit" disabled={loading} className="w-full">
             {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
           </Button>
         </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;