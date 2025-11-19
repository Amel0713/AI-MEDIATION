import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const JoinCase = () => {
  const { token } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [contextData, setContextData] = useState({
    backgroundText: '',
    goalsText: '',
    acceptableOutcomeText: '',
    constraintsText: '',
    sensitivityLevel: 'normal',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { validateInviteToken, joinCaseWithToken, insertContext } = useCase();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const data = await validateInviteToken(token);
        setCaseData(data);
      } catch (err) {
        setError('Invalid or expired invite token');
        console.error('Error validating token:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      validateToken();
    }
  }, [token, validateInviteToken]);

  const handleInputChange = (field, value) => {
    setContextData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await joinCaseWithToken(caseData.id);
      await insertContext(caseData.id, {
        background_text: contextData.backgroundText,
        goals_text: contextData.goalsText,
        acceptable_outcome_text: contextData.acceptableOutcomeText,
        constraints_text: contextData.constraintsText,
        sensitivity_level: contextData.sensitivityLevel,
      });
      navigate(`/mediation/${caseData.id}`);
    } catch (err) {
      setError('Error joining case');
      console.error('Error joining case:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card hover>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Validating invite...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <Card hover>
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Join Mediation Case
          </h1>
          <p className="text-red-600 text-center mb-6">{error}</p>
          <div className="text-center">
            <Button onClick={() => navigate('/dashboard')} lift>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card hover>
        <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Join Mediation Case
        </h1>
        <p className="mb-8 text-neutral-600 text-center text-lg">Case: <span className="font-semibold">{caseData.title}</span></p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slide-up">
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Background
            </label>
            <textarea
              value={contextData.backgroundText}
              onChange={(e) => handleInputChange('backgroundText', e.target.value)}
              placeholder="Provide background information"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50 resize-none"
              rows={3}
              required
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Goals
            </label>
            <textarea
              value={contextData.goalsText}
              onChange={(e) => handleInputChange('goalsText', e.target.value)}
              placeholder="What are your goals?"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50 resize-none"
              rows={3}
              required
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Acceptable Outcome
            </label>
            <textarea
              value={contextData.acceptableOutcomeText}
              onChange={(e) => handleInputChange('acceptableOutcomeText', e.target.value)}
              placeholder="What outcome would be acceptable?"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50 resize-none"
              rows={3}
              required
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Constraints
            </label>
            <textarea
              value={contextData.constraintsText}
              onChange={(e) => handleInputChange('constraintsText', e.target.value)}
              placeholder="Any constraints or limitations?"
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50 resize-none"
              rows={3}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Sensitivity Level
            </label>
            <select
              value={contextData.sensitivityLevel}
              onChange={(e) => handleInputChange('sensitivityLevel', e.target.value)}
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50"
              required
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex space-x-4 pt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <Button type="submit" disabled={loading} className="flex-1" lift>
              {loading ? 'Joining...' : 'Join Case'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1" lift>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default JoinCase;