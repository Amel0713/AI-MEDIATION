import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCase } from '../contexts/CaseContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const CreateCaseWizard = () => {
  const [step, setStep] = useState(1);
  const [caseData, setCaseData] = useState({
    title: '',
    description: '',
    type: 'personal',
    inviteEmail: '',
    inviteToken: '',
    backgroundText: '',
    goalsText: '',
    acceptableOutcomeText: '',
    constraintsText: '',
    sensitivityLevel: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { createDraftCase, generateInviteToken, insertContext, activateCase } = useCase();

  const handleInputChange = (field, value) => {
    setCaseData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCase = await createDraftCase({
        title: caseData.title,
        description: caseData.description,
        type: caseData.type,
      });
      setCaseData(prev => ({ ...prev, id: newCase.id }));
      setStep(2);
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Error creating case');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await generateInviteToken(caseData.id, caseData.inviteEmail);
      setCaseData(prev => ({ ...prev, inviteToken: token }));
      setStep(3);
    } catch (error) {
      console.error('Error generating invite:', error);
      alert('Error generating invite');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await insertContext(caseData.id, {
        background_text: caseData.backgroundText,
        goals_text: caseData.goalsText,
        acceptable_outcome_text: caseData.acceptableOutcomeText,
        constraints_text: caseData.constraintsText,
        sensitivity_level: caseData.sensitivityLevel,
      });
      await activateCase(caseData.id);
      navigate(`/mediation/${caseData.id}`);
    } catch (error) {
      console.error('Error finalizing case:', error);
      alert('Error finalizing case');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-6">
      <Input
        label="Case Title"
        value={caseData.title}
        onChange={(e) => handleInputChange('title', e.target.value)}
        placeholder="Enter case title"
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={caseData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the mediation case"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Case Type
        </label>
        <select
          value={caseData.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="personal">Personal</option>
          <option value="workplace">Workplace</option>
          <option value="agreement">Agreement</option>
        </select>
      </div>
      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Next'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-6">
      <Input
        label="Invite Email (optional)"
        type="email"
        value={caseData.inviteEmail}
        onChange={(e) => handleInputChange('inviteEmail', e.target.value)}
        placeholder="invited@example.com"
      />
      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Invite Link'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background
        </label>
        <textarea
          value={caseData.backgroundText}
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
          value={caseData.goalsText}
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
          value={caseData.acceptableOutcomeText}
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
          value={caseData.constraintsText}
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
          value={caseData.sensitivityLevel}
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
        <Button type="submit" disabled={loading}>
          {loading ? 'Finalizing...' : 'Create Case'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
      </div>
    </form>
  );

  const renderInviteLink = () => {
    if (!caseData.inviteToken) return null;
    const inviteUrl = `${window.location.origin}/join/${caseData.inviteToken}`;
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">Invite Link:</p>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inviteUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white"
          />
          <Button
            type="button"
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            variant="outline"
          >
            Copy
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <h1 className="text-2xl font-bold mb-6">Create New Mediation Case</h1>
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`flex-1 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Case Details</span>
            <span>Invite</span>
            <span>Context</span>
          </div>
        </div>
        {step === 1 && renderStep1()}
        {step === 2 && (
          <>
            {renderStep2()}
            {renderInviteLink()}
          </>
        )}
        {step === 3 && renderStep3()}
      </Card>
    </div>
  );
};

export default CreateCaseWizard;