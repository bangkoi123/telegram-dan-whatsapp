import React, { useState } from 'react';
import { mockTelegramApi } from '../../api/mockApi';
import ToggleSwitch from '../../components/common/ToggleSwitch';

const SettingsModal = ({ onClose, onSave, initialApiConfig, initialHumanizationConfig }) => {
    const [apiConfig, setApiConfig] = useState(initialApiConfig);
    const [humanizationConfig, setHumanizationConfig] = useState(initialHumanizationConfig);
    const [isLoading, setIsLoading] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    const [apiKeyTestResult, setApiKeyTestResult] = useState({ message: '', status: '' });

    const handleApiChange = (e) => {
        const { id, value } = e.target;
        setApiConfig(prev => ({ ...prev, [id]: value }));
        if (validationError) setValidationError(null);
    };

    const handleHumanizationChange = (key, value) => {
        setHumanizationConfig(prev => ({ ...prev, [key]: value }));
        if (key === 'aiApiKey') {
            setApiKeyTestResult({ message: '', status: '' });
        }
    };

    const handleActivityTypeChange = (e) => {
        const { id, checked } = e.target;
        setHumanizationConfig(prev => ({
            ...prev,
            activities: { ...prev.activities, [id]: checked }
        }));
    };

    const handleTestApiKey = async () => {
        setIsTestingApiKey(true);
        setApiKeyTestResult({ message: '', status: '' });
        const result = await mockTelegramApi.testGeminiApiKey(humanizationConfig.aiApiKey);
        setApiKeyTestResult({
            message: result.message,
            status: result.success ? 'success' : 'error'
        });
        setIsTestingApiKey(false);
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setValidationError(null);
        try {
            await mockTelegramApi.validateApiCredentials(apiConfig.apiId, apiConfig.apiHash);
            
            onSave({ 
                apiConfig: apiConfig, 
                humanizationConfig: humanizationConfig 
            });
            onClose();
        } catch (err) {
            setValidationError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <form onSubmit={handleSave}>
                    <h2>General Settings</h2>
                    <div className="settings-grid">
                        <h3 style={{gridColumn: '1 / 2'}}>Telegram API Configuration</h3>
                        <h3 style={{gridColumn: '2 / 3'}}>AI Personality</h3>
                        
                        <div>
                            <p>Your API ID and Hash are used for all accounts. You can get them from <a href="https://my.telegram.org" target="_blank" rel="noopener noreferrer">my.telegram.org</a>.
                                <br/>Since this is a test environment, any non-empty values will be accepted.
                            </p>
                            {validationError && <p className="error-message">{validationError}</p>}
                            <div className="form-group">
                                <label htmlFor="apiId">API ID</label>
                                <input id="apiId" type="text" value={apiConfig.apiId} onChange={handleApiChange} required autoFocus />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apiHash">API Hash</label>
                                <input id="apiHash" type="text" value={apiConfig.apiHash} onChange={handleApiChange} required />
                            </div>
                        </div>

                        <div>
                            <div className="api-key-group">
                                <div className="form-group">
                                    <label htmlFor="aiApiKey">Gemini API Key</label>
                                    <input 
                                        id="aiApiKey"
                                        type="password"
                                        value={humanizationConfig.aiApiKey} 
                                        onChange={(e) => handleHumanizationChange('aiApiKey', e.target.value)}
                                        placeholder="Enter your Gemini API Key"
                                    />
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={handleTestApiKey} disabled={isTestingApiKey || !humanizationConfig.aiApiKey}>
                                    {isTestingApiKey ? 'Testing...' : 'Test Key'}
                                </button>
                            </div>
                            {apiKeyTestResult.message && <p className={`api-key-test-result ${apiKeyTestResult.status}`}>{apiKeyTestResult.message}</p>}

                            <div className="form-group">
                                <label htmlFor="systemInstruction">AI Persona / System Instruction</label>
                                <textarea 
                                    id="systemInstruction"
                                    value={humanizationConfig.systemInstruction} 
                                    onChange={(e) => handleHumanizationChange('systemInstruction', e.target.value)}
                                    placeholder="e.g., You are a friendly university student from Indonesia who loves technology and coffee. Your tone is casual and sometimes uses popular slang."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <h3>Account Humanization</h3>
                        <div className="humanization-controls">
                            <div className="form-group">
                                <label>Enable Humanization Engine</label>
                                <ToggleSwitch 
                                    isOn={humanizationConfig.isEnabled} 
                                    onToggle={() => handleHumanizationChange('isEnabled', !humanizationConfig.isEnabled)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Activity Intensity</label>
                                <div className="intensity-group">
                                    {['Low', 'Medium', 'High'].map(level => (
                                        <button 
                                            type="button"
                                            key={level}
                                            className={`btn ${humanizationConfig.intensity === level.toLowerCase() ? 'active' : ''}`}
                                            onClick={() => handleHumanizationChange('intensity', level.toLowerCase())}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="humanization-controls">
                             <div className="form-group" style={{alignItems: 'flex-start', flexDirection: 'column'}}>
                                <label style={{marginBottom: '0.75rem'}}>Enabled Activities</label>
                                <div className="activity-checkboxes">
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="chat" checked={humanizationConfig.activities.chat} onChange={handleActivityTypeChange} />
                                        <label htmlFor="chat">Account-to-Account Chat</label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="statusUpdate" checked={humanizationConfig.activities.statusUpdate} onChange={handleActivityTypeChange} />
                                        <label htmlFor="statusUpdate">Post Status Updates</label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="interactAI" checked={humanizationConfig.activities.interactAI} onChange={handleActivityTypeChange} />
                                        <label htmlFor="interactAI">Interact with AI Bots</label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="joinChannels" checked={humanizationConfig.activities.joinChannels} onChange={handleActivityTypeChange} />
                                        <label htmlFor="joinChannels">Join Public Channels</label>
                                    </div>
                                    <div className="checkbox-group">
                                        <input type="checkbox" id="updateProfile" checked={humanizationConfig.activities.updateProfile} onChange={handleActivityTypeChange} />
                                        <label htmlFor="updateProfile">Periodically Update Profile</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{marginTop: '2rem', width: '100%'}}>
                        {isLoading ? 'Saving...' : 'Save All Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;