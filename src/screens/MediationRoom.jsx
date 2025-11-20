import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { summarizeSituation, suggestCompromises, rephraseMessage, generateAgreementDraft, improveAgreementClarity } from '../services/aiMediator';

// Main mediation room component for real-time chat and AI-assisted mediation
const MediationRoom = () => {
  const { caseId } = useParams(); // Get case ID from URL
  const navigate = useNavigate();
  const { user } = useAuth(); // Current authenticated user
  const [message, setMessage] = useState(''); // Current message being typed
  const [messages, setMessages] = useState([]); // Chat messages
  const [participants, setParticipants] = useState([]); // Case participants
  const [contexts, setContexts] = useState([]); // Party contexts/backgrounds
  const [agreement, setAgreement] = useState(null); // Current agreement draft
  const [draftText, setDraftText] = useState(''); // Editable agreement text
  const [activeTab, setActiveTab] = useState('context'); // Active sidebar tab
  const [loading, setLoading] = useState(true); // Loading state
  const [signingParticipant, setSigningParticipant] = useState(null); // Participant being signed
  const [signingName, setSigningName] = useState(''); // Name entered for signing
  const [caseData, setCaseData] = useState(null); // Local case data state

  // Fetch all case-related data from Supabase
  const fetchData = async () => {
    if (!caseId) return;

    try {
      // Fetch case data first
      const caseResult = await supabase.from('cases').select('*').eq('id', caseId).single();
      if (caseResult.error) {
        console.error('Error fetching case:', caseResult.error);
        navigate('/dashboard');
        return;
      }
      setCaseData(caseResult.data);

      // Parallel fetch for better performance
      const [messagesResult, participantsResult, contextsResult, agreementResult] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: true }),
        supabase
          .from('case_participants')
          .select('*, profiles(*)')
          .eq('case_id', caseId),
        supabase
          .from('case_context')
          .select('*')
          .eq('case_id', caseId),
        supabase
          .from('agreements')
          .select('*')
          .eq('case_id', caseId)
          .single()
      ]);

      if (messagesResult.error) throw messagesResult.error;
      setMessages(messagesResult.data || []);

      if (participantsResult.error) throw participantsResult.error;
      setParticipants(participantsResult.data || []);

      if (contextsResult.error) throw contextsResult.error;
      setContexts(contextsResult.data || []);

      // PGRST116 = no rows found, which is OK for new cases
      if (agreementResult.error && agreementResult.error.code !== 'PGRST116') throw agreementResult.error;
      setAgreement(agreementResult.data);
      setDraftText(agreementResult.data?.draft_text || '');

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize component and set up real-time subscriptions
  useEffect(() => {
    fetchData();

    // Real-time subscription for new messages
    const messagesChannel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `case_id=eq.${caseId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    // Real-time subscription for agreement changes
    const agreementsChannel = supabase
      .channel('agreements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agreements',
        filter: `case_id=eq.${caseId}`,
      }, (payload) => {
        setAgreement(payload.new);
      })
      .subscribe();

    // Real-time subscription for participant updates (e.g., signing status)
    const participantsChannel = supabase
      .channel('case_participants')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'case_participants',
        filter: `case_id=eq.${caseId}`,
      }, (payload) => {
        setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(agreementsChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [caseId, navigate]);

  const getSenderName = (msg) => {
    if (msg.sender_type === 'ai') return 'AI Mediator';
    const participant = participants.find(p => p.user_id === msg.sender_user_id);
    if (participant) {
      return participant.role_in_case === 'initiator' ? 'Party A' : 'Party B';
    }
    return 'Unknown';
  };

  const getPartyContexts = () => {
    return contexts.map(ctx => {
      const participant = participants.find(p => p.user_id === ctx.user_id);
      const party = participant?.role_in_case === 'initiator' ? 'Party A' : 'Party B';
      return { party, background: ctx.background_text, goals: ctx.goals_text, acceptableOutcome: ctx.acceptable_outcome_text, constraints: ctx.constraints_text };
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          case_id: caseId,
          sender_user_id: user.id,
          sender_type: 'user',
          content: message.trim(),
          message_type: 'plain',
        });

      if (error) throw error;
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSummarize = async () => {
    const caseMeta = { title: caseData.title, type: caseData.type };
    const partyContexts = getPartyContexts();
    const recentMessages = messages.slice(-50).map(msg => ({
      sender: getSenderName(msg),
      content: msg.content
    }));
    const summary = await summarizeSituation(caseMeta, partyContexts, recentMessages);
    await supabase.from('cases').update({ ai_summary: summary }).eq('id', caseId);
    await supabase.from('messages').insert({
      case_id: caseId,
      sender_user_id: null,
      sender_type: 'ai',
      content: `AI Summary: ${summary}`,
      message_type: 'ai_suggestion',
    });
  };

  const handleSuggestCompromises = async () => {
    const caseMeta = { title: caseData.title, type: caseData.type };
    const partyContexts = getPartyContexts();
    const recentMessages = messages.slice(-50).map(msg => ({
      sender: getSenderName(msg),
      content: msg.content
    }));
    const suggestions = await suggestCompromises(caseMeta, partyContexts, recentMessages, agreement?.draft_text);
    await supabase.from('messages').insert({
      case_id: caseId,
      sender_user_id: null,
      sender_type: 'ai',
      content: `AI Suggested Compromises: ${suggestions}`,
      message_type: 'ai_suggestion',
    });
  };

  const handleRephrase = async () => {
    const lastUserMessage = messages.filter(m => m.sender_type === 'user').slice(-1)[0]?.content;
    if (!lastUserMessage) return;
    const rephrased = await rephraseMessage(lastUserMessage);
    await supabase.from('messages').insert({
      case_id: caseId,
      sender_user_id: null,
      sender_type: 'ai',
      content: `Rephrased calmly: ${rephrased}`,
      message_type: 'ai_suggestion',
    });
  };

  const handleGenerateDraft = async () => {
    const caseMeta = { title: caseData.title, type: caseData.type };
    const partyContexts = getPartyContexts();
    const recentMessages = messages.slice(-50).map(msg => ({
      sender: getSenderName(msg),
      content: msg.content
    }));
    const draft = await generateAgreementDraft(caseMeta, partyContexts, recentMessages);
    if (agreement) {
      await supabase.from('agreements').update({ draft_text: draft }).eq('case_id', caseId);
    } else {
      await supabase.from('agreements').insert({
        case_id: caseId,
        draft_text: draft,
        status: 'draft',
      });
    }
    await supabase.from('messages').insert({
      case_id: caseId,
      sender_user_id: null,
      sender_type: 'ai',
      content: `AI Draft Agreement: ${draft}`,
      message_type: 'ai_suggestion',
    });
  };

  const handleImproveClarity = async () => {
    const improved = await improveAgreementClarity(draftText);
    await supabase.from('agreements').update({ draft_text: improved }).eq('case_id', caseId);
    setDraftText(improved);
  };

  const handleFinalize = async () => {
    await supabase.from('agreements').update({ finalized_text: draftText, status: 'finalized', finalized_at: new Date().toISOString() }).eq('case_id', caseId);
  };

  const handleSign = async () => {
    const participant = participants.find(p => p.id === signingParticipant);
    const fullName = participant?.profiles?.full_name || participant?.profiles?.email || '';
    if (signingName === fullName) {
      await supabase.from('case_participants').update({ has_signed_agreement: true, signed_at: new Date().toISOString() }).eq('id', signingParticipant);
      // Check if all signed
      const { data: updatedParticipants } = await supabase.from('case_participants').select('has_signed_agreement').eq('case_id', caseId);
      const allSigned = updatedParticipants.every(p => p.has_signed_agreement);
      if (allSigned) {
        await supabase.from('cases').update({ status: 'resolved' }).eq('id', caseId);
      }
      setSigningParticipant(null);
      setSigningName('');
    } else {
      alert("Name does not match. Please try again.");
    }
  };

  if (!caseData || loading) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: 'context', label: 'Context' },
    { id: 'summary', label: 'AI Summary' },
    { id: 'agreement', label: 'Agreement' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{caseData.title}</h1>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Mediation Chat</h2>
            <div className="h-96 overflow-y-auto border border-gray-300 rounded p-4 mb-4 bg-gray-50">
              {messages.length === 0 ? (
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="mb-3 p-3 bg-white rounded shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <strong className="text-sm text-blue-600">{getSenderName(msg)}</strong>
                      <small className="text-gray-500 text-xs">
                        {new Date(msg.created_at).toLocaleString()}
                      </small>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <small className="text-gray-400 text-xs">{msg.message_type}</small>
                  </div>
                ))
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button onClick={handleSummarize} variant="outline" size="sm">Ask AI to summarize the situation</Button>
              <Button onClick={handleSuggestCompromises} variant="outline" size="sm">Ask AI for suggested compromise options</Button>
              <Button onClick={handleRephrase} variant="outline" size="sm">Ask AI to rephrase my last message more calmly</Button>
              <Button onClick={handleGenerateDraft} variant="outline" size="sm">Generate / update draft agreement</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex border-b mb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-96 overflow-y-auto">
              {activeTab === 'context' && (
                <div>
                  <h3 className="font-semibold mb-2">Case Context</h3>
                  {contexts.map((ctx) => {
                    const participant = participants.find(p => p.user_id === ctx.user_id);
                    const party = participant?.role_in_case === 'initiator' ? 'Party A' : 'Party B';
                    return (
                      <div key={ctx.id} className="mb-4 p-3 bg-gray-50 rounded">
                        <h4 className="font-medium">{party}</h4>
                        <p><strong>Background:</strong> {ctx.background_text || 'Not provided'}</p>
                        <p><strong>Goals:</strong> {ctx.goals_text || 'Not provided'}</p>
                        <p><strong>Acceptable Outcome:</strong> {ctx.acceptable_outcome_text || 'Not provided'}</p>
                        <p><strong>Constraints:</strong> {ctx.constraints_text || 'Not provided'}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'summary' && (
                <div>
                  <h3 className="font-semibold mb-2">AI Summary</h3>
                  <p>{caseData.ai_summary || 'No summary available yet.'}</p>
                </div>
              )}

              {activeTab === 'agreement' && (
                <div>
                  <h3 className="font-semibold mb-2">Agreement</h3>
                  {agreement?.status === 'draft' ? (
                    <div>
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="w-full h-64 p-2 border border-gray-300 rounded"
                        placeholder="Draft agreement text..."
                      />
                      <div className="flex gap-2 mt-2">
                        <Button onClick={handleImproveClarity} variant="outline" size="sm">Ask AI to improve clarity</Button>
                        <Button onClick={handleFinalize} size="sm">Finalize agreement</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap">{agreement?.finalized_text || 'No finalized agreement.'}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Signing Status</h4>
                    {participants.map(p => {
                      const displayName = p.profiles.full_name || p.profiles.email || 'Unknown';
                      return (
                        <div key={p.id} className="flex justify-between items-center p-2 border-b border-gray-200">
                          <span>{displayName} ({p.role_in_case === 'initiator' ? 'Party A' : 'Party B'})</span>
                          {p.has_signed_agreement ? (
                            <span className="text-green-600">Signed at {new Date(p.signed_at).toLocaleString()}</span>
                          ) : (
                            <Button onClick={() => setSigningParticipant(p.id)} size="sm">Sign / Acknowledge</Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {signingParticipant && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm mb-2">Please enter your full name to confirm signing:</p>
                      <div className="flex space-x-2">
                        <Input
                          value={signingName}
                          onChange={(e) => setSigningName(e.target.value)}
                          placeholder="Full name"
                          className="flex-1"
                        />
                        <Button onClick={handleSign} size="sm">Confirm</Button>
                        <Button onClick={() => { setSigningParticipant(null); setSigningName(''); }} variant="outline" size="sm">Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MediationRoom;