import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const JoinCasePrompt = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a valid invite token');
      return;
    }
    navigate(`/join/${token.trim()}`);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Join Mediation Case</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Invite Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter the invite token"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              Join Case
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default JoinCasePrompt;