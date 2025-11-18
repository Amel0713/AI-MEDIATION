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
      <div className="max-w-md mx-auto">
        <Card>
          <p className="text-center">Validating invite...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-2xl font-bold mb-6">Join Mediation Case</h1>
          <p className="text-red-600 text-center">{error}</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Join Mediation Case</h1>
        <p className="mb-4 text-gray-600">Case: {caseData.title}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background
            </label>
            <textarea
              value={contextData.backgroundText}
              onChange={(e) => handleInputChange('backgroundText', e.target.value)}
              placeholder="Provide background information"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goals
            </label>
            <textarea
              value={contextData.goalsText}
              onChange={(e) => handleInputChange('goalsText', e.target.value)}
              placeholder="What are your goals?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acceptable Outcome
            </label>
            <textarea
              value={contextData.acceptableOutcomeText}
              onChange={(e) => handleInputChange('acceptableOutcomeText', e.target.value)}
              placeholder="What outcome would be acceptable?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Constraints
            </label>
            <textarea
              value={contextData.constraintsText}
              onChange={(e) => handleInputChange('constraintsText', e.target.value)}
              placeholder="Any constraints or limitations?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sensitivity Level
            </label>
            <select
              value={contextData.sensitivityLevel}
              onChange={(e) => handleInputChange('sensitivityLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Joining...' : 'Join Case'}
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

export default JoinCase;