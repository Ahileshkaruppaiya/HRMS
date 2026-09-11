import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { 
  Fingerprint, 
  Send, 
  Calculator, 
  CheckCircle2, 
  Save, 
  Bot,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  getStoredGeminiApiKey,
  setStoredGeminiApiKey,
  getStoredGeminiModel,
  setStoredGeminiModel,
  listGeminiModels,
  GeminiModelInfo
} from '../../services/geminiApiService';

export const IntegrationsSettings: React.FC = () => {
  const { 
    integrationsConfig, 
    updateIntegrationsConfig 
  } = useHRMS();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [configState, setConfigState] = useState({ ...integrationsConfig });

  // Gemini API Configuration State inside Settings
  const [apiKey, setApiKey] = useState<string>(getStoredGeminiApiKey());
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>(getStoredGeminiModel());
  const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>([]);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyTestStatus, setKeyTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [keyErrorMessage, setKeyErrorMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setKeyTestStatus('error');
      setKeyErrorMessage('Please enter an API key first.');
      return;
    }
    setIsTestingKey(true);
    setKeyTestStatus('idle');
    setKeyErrorMessage('');
    try {
      const models = await listGeminiModels(apiKey.trim());
      setAvailableModels(models);
      setKeyTestStatus('success');
      if (models.length > 0 && !models.some(m => m.name === selectedModel)) {
        setSelectedModel(models[0].name);
      }
    } catch (err: any) {
      setKeyTestStatus('error');
      setKeyErrorMessage(err.message || 'Verification failed. Please check your API key.');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrationsConfig(configState);
    setStoredGeminiApiKey(apiKey.trim());
    setStoredGeminiModel(selectedModel);
    triggerToast('All integration endpoints and Gemini AI credentials saved successfully');
  };

  return (
    <div style={{ padding: '0 4px' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0E7490',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(14, 116, 144, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 4px' }}>Third-Party Enterprise Integrations & APIs</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Connect biometric punch devices, WhatsApp Cloud, Google Gemini AI, email relays, and ERP systems</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '950px' }}>
        {/* 1. Google Gemini & Seri AI Assistant Integration */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>Seri Chat Bot & Google Gemini AI API</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>Real-time generative intelligence for HRMS queries across Tamil, Tanglish, Hindi, and English</p>
              </div>
            </div>
            <span style={{ 
              backgroundColor: apiKey ? '#DCFCE7' : '#FEF3C7', 
              color: apiKey ? '#166534' : '#B45309', 
              padding: '4px 10px', 
              borderRadius: '9999px', 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}>
              {apiKey ? 'API CONNECTED' : 'LOCAL ENGINE (NO KEY)'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Google Gemini API Key
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
                  title={showApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Gemini Model</label>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={isTestingKey || !apiKey.trim()}
                  style={{ background: 'none', border: 'none', color: '#0E7490', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <RefreshCw size={11} />
                  <span>{isTestingKey ? 'Testing...' : 'Test & List Models'}</span>
                </button>
              </div>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
              >
                {availableModels.length > 0 ? (
                  availableModels.map(m => (
                    <option key={m.name} value={m.name}>{m.displayName || m.name}</option>
                  ))
                ) : (
                  <>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Recommended, Ultra-Fast)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {keyTestStatus === 'success' && (
            <div style={{ fontSize: '0.8rem', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontWeight: 600 }}>
              ✓ API Key verified successfully! Available models loaded from Google Gemini endpoint.
            </div>
          )}

          {keyTestStatus === 'error' && (
            <div style={{ fontSize: '0.8rem', color: '#DC2626', backgroundColor: '#FEE2E2', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontWeight: 600 }}>
              ✕ {keyErrorMessage}
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Free Google AI Studio key: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#0E7490', fontWeight: 700 }}>Get Gemini API Key ↗</a></span>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  setApiKey('');
                  setStoredGeminiApiKey('');
                  triggerToast('Gemini API key disconnected');
                }}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Disconnect Key
              </button>
            )}
          </div>
        </div>

        {/* 2. Biometric Hardware */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Fingerprint size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>Biometric Attendance Devices</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>eSSL & ZKTeco biometric fingerprint and facial scanner gateway</p>
              </div>
            </div>
            <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
              CONNECTED & SYNCING
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Device Server IP</label>
              <input
                type="text"
                value={configState.biometricDevice.ipAddress}
                onChange={e => setConfigState({
                  ...configState,
                  biometricDevice: { ...configState.biometricDevice, ipAddress: e.target.value }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Port</label>
              <input
                type="number"
                value={configState.biometricDevice.port}
                onChange={e => setConfigState({
                  ...configState,
                  biometricDevice: { ...configState.biometricDevice, port: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Polling Interval</label>
              <select
                value={configState.biometricDevice.syncIntervalMins}
                onChange={e => setConfigState({
                  ...configState,
                  biometricDevice: { ...configState.biometricDevice, syncIntervalMins: Number(e.target.value) }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value={5}>Every 5 Minutes</option>
                <option value={15}>Every 15 Minutes (Standard)</option>
                <option value={30}>Every 30 Minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. WhatsApp Cloud API & Twilio SMS */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>WhatsApp & SMS Gateways</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>Meta WhatsApp Cloud API credentials and Twilio SMS sender authentication</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>WhatsApp Phone Number ID</label>
              <input
                type="text"
                value={configState.whatsappApi.phoneNumberId}
                onChange={e => setConfigState({
                  ...configState,
                  whatsappApi: { ...configState.whatsappApi, phoneNumberId: e.target.value }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>SMS Sender ID</label>
              <input
                type="text"
                value={configState.smsGateway.senderId}
                onChange={e => setConfigState({
                  ...configState,
                  smsGateway: { ...configState.smsGateway, senderId: e.target.value }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* 4. Accounting & Webhooks */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E7ECF3', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ECFEFF', color: '#0E7490', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1E293B' }}>Accounting & REST Webhooks</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>Tally Prime XML synchronization and real-time HTTP event dispatch webhooks</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Webhook Endpoint URL</label>
              <input
                type="url"
                value={configState.webhooks.endpointUrl}
                onChange={e => setConfigState({
                  ...configState,
                  webhooks: { ...configState.webhooks, endpointUrl: e.target.value }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Accounting Software Sync</label>
              <select
                value={configState.accountingSoftware.software}
                onChange={e => setConfigState({
                  ...configState,
                  accountingSoftware: { ...configState.accountingSoftware, software: e.target.value }
                })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
              >
                <option value="Tally Prime XML Sync & Zoho Books">Tally Prime XML Sync & Zoho Books</option>
                <option value="QuickBooks Online API">QuickBooks Online API</option>
                <option value="SAP ERP Human Capital Management">SAP ERP Human Capital Management</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0E7490',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 28px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          <Save size={18} />
          <span>Save All Integrations</span>
        </button>
      </form>
    </div>
  );
};
export default IntegrationsSettings;
