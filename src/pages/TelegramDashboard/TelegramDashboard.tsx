import React, { useState, useCallback, useEffect, useRef } from 'react';
import { initialTelegramAccounts, mockTelegramApi } from '../../api/mockApi';
import { useToasts } from '../../context/ToastContext';
import AccountCard from '../../components/account/AccountCard';
import AddTelegramAccountModal from './AddTelegramAccountModal';
import EditProxyModal from './EditProxyModal';
import { BackIcon } from '../../components/icons';

const TelegramDashboard = ({ onBack, apiConfig, humanizationConfig, addLogEntry }) => {
  const [accounts, setAccounts] = useState(() => {
    try {
      const savedAccounts = localStorage.getItem('telegramAccounts');
      return savedAccounts ? JSON.parse(savedAccounts) : initialTelegramAccounts;
    } catch (error) {
      console.error("Failed to parse accounts from localStorage", error);
      return initialTelegramAccounts;
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProxyModalOpen, setIsEditProxyModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { addToast } = useToasts();
  
  const engineTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('telegramAccounts', JSON.stringify(accounts));
    } catch (error) {
      console.error("Failed to save accounts to localStorage", error);
    }
  }, [accounts]);
  
  
  // --- Humanization Engine ---
  const runHumanizationEngine = useCallback(() => {
    if (!humanizationConfig.isEnabled) return;
    
    const currentHour = new Date().getHours();
    if (currentHour >= 1 && currentHour < 7) {
        return;
    }

    setAccounts(prevAccounts => {
        const breedableAccounts = prevAccounts.filter(acc => acc.isEnabled && acc.isHumanized);
        if (breedableAccounts.length < 1) return prevAccounts;

        const intensityMap = { low: 0.1, medium: 0.25, high: 0.5 };
        if (Math.random() > intensityMap[humanizationConfig.intensity]) {
            return prevAccounts;
        }

        const accountToHumanize = breedableAccounts[Math.floor(Math.random() * breedableAccounts.length)];
        
        if (accountToHumanize.status === 'restricted' || accountToHumanize.status === 'inactive') {
            const logMessage = `Account <strong>${accountToHumanize.phone}</strong> is ${accountToHumanize.status}. Skipping activity cycle to cool down.`;
            addLogEntry({
                id: Date.now(),
                timestamp: Date.now(),
                message: logMessage,
                activityType: 'cooldown',
                platform: 'telegram',
            });
            return prevAccounts;
        }
        
        const availableActivities = Object.entries(humanizationConfig.activities)
            .filter(([, isEnabled]) => isEnabled)
            .map(([key]) => key);

        if (availableActivities.length === 0) return prevAccounts;

        let activityType = availableActivities[Math.floor(Math.random() * availableActivities.length)];
        
        const isAiActivity = ['statusUpdate', 'interactAI', 'updateProfile'].includes(activityType);

        if (isAiActivity && !humanizationConfig.aiApiKey) {
            const logMessage = `AI API Key is not set. Skipping AI-based activity for <strong>${accountToHumanize.phone}</strong>.`;
            addLogEntry({
                id: Date.now(),
                timestamp: Date.now(),
                message: logMessage,
                activityType: 'cooldown',
                platform: 'telegram',
            });
            return prevAccounts;
        }

        let logMessage = '';
        const persona = humanizationConfig.systemInstruction ? ` (using persona)` : '';

        switch (activityType) {
            case 'chat': {
                const otherAccounts = breedableAccounts.filter(a => a.id !== accountToHumanize.id && a.status === 'active');
                if (otherAccounts.length > 0) {
                    const targetAccount = otherAccounts[Math.floor(Math.random() * otherAccounts.length)];
                    logMessage = `Account <strong>${accountToHumanize.phone}</strong> sent a chat to <strong>${targetAccount.phone}</strong>.`;
                } else {
                    logMessage = `Account <strong>${accountToHumanize.phone}</strong> tried to chat, but no other active accounts were available.`;
                }
                break;
            }
            case 'statusUpdate':
                logMessage = `Account <strong>${accountToHumanize.phone}</strong> posted a new status update${persona}.`;
                break;
            case 'interactAI':
                logMessage = `Account <strong>${accountToHumanize.phone}</strong> interacted with an AI Bot${persona}.`;
                break;
            case 'joinChannels':
                logMessage = `Account <strong>${accountToHumanize.phone}</strong> joined a public channel.`;
                break;
            case 'updateProfile': {
                const updateType = Math.random() > 0.5 ? 'profile picture' : `bio${persona}`;
                logMessage = `Account <strong>${accountToHumanize.phone}</strong> updated its ${updateType}.`;
                break;
            }
            default:
                return prevAccounts;
        }

        const newActivity = {
            type: activityType,
            timestamp: Date.now(),
            details: logMessage.replace(/<strong>(.*?)<\/strong>/g, '$1'),
        };
        
        addLogEntry({
            id: Date.now(),
            timestamp: newActivity.timestamp,
            message: logMessage,
            activityType: activityType,
            platform: 'telegram',
        });

        return prevAccounts.map(acc => 
            acc.id === accountToHumanize.id 
            ? { ...acc, lastActivity: newActivity }
            : acc
        );
    });
  }, [humanizationConfig, addLogEntry]);

  useEffect(() => {
      if (engineTimerRef.current) clearInterval(engineTimerRef.current);
      if (humanizationConfig.isEnabled) {
          engineTimerRef.current = setInterval(runHumanizationEngine, 5000);
      }
      return () => {
          if (engineTimerRef.current) clearInterval(engineTimerRef.current);
      };
  }, [humanizationConfig.isEnabled, runHumanizationEngine]);

  const handleOpenAddAccountModal = () => {
      if (!apiConfig.apiId || !apiConfig.apiHash) {
          addToast({ type: 'error', message: 'Please set your Telegram API ID and Hash first in the main Settings.' });
      } else {
          setIsModalOpen(true);
      }
  };

  const handleAddAccount = useCallback((phone, proxy) => {
    let accountExists = false;
    setAccounts(prev => {
      if (prev.some(acc => acc.phone === phone)) {
        addToast({ type: 'error', message: `Account with phone number ${phone} already exists.` });
        accountExists = true;
        return prev;
      }
      const newAccount = {
        id: Date.now(),
        phone,
        status: 'connecting',
        lastLogin: 'Connecting...',
        isEnabled: true,
        isHumanized: true, // Default new accounts to be part of the program
        dailyUsage: 0,
        dailyLimit: 3000,
        proxy: (proxy && proxy.hostname) ? proxy : null,
        errorContext: null,
      };
      
      return [...prev, newAccount];
    });

    if (!accountExists) {
        setTimeout(async () => {
            const accountToCheck = accounts.find(acc => acc.phone === phone);
            const { status, errorContext } = await mockTelegramApi.checkAccountStatus(accountToCheck);
            setAccounts(current => current.map(acc => 
                acc.phone === phone
                ? { ...acc, status: status, lastLogin: 'Just now', errorContext } 
                : acc
            ));
            addToast({ type: 'success', message: `Account ${phone} added successfully.` });
        }, 2000);
    }
  }, [addToast, accounts]);

  const handleDeleteAccount = useCallback((accountId) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
        const accountToDelete = accounts.find(acc => acc.id === accountId);
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
        addToast({ type: 'success', message: `Account ${accountToDelete.phone} has been deleted.` });
    }
  }, [accounts, addToast]);
  
  const handleToggleAccount = useCallback((accountId) => {
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId
        ? { ...acc, isEnabled: !acc.isEnabled }
        : acc
      ));
  }, []);
  
  const handleToggleHumanize = useCallback((accountId) => {
      setAccounts(prev => prev.map(acc => 
        acc.id === accountId
        ? { ...acc, isHumanized: !acc.isHumanized }
        : acc
      ));
  }, []);

  const handleRefreshStatus = useCallback(async (accountId) => {
    const accountToRefresh = accounts.find(acc => acc.id === accountId);
    if (!accountToRefresh) return;
      
    setAccounts(prev => prev.map(acc => 
        acc.id === accountId ? { ...acc, status: 'connecting', lastLogin: 'Checking...', errorContext: null } : acc
    ));

    const { status: newStatus, errorContext } = await mockTelegramApi.checkAccountStatus(accountToRefresh);

    setAccounts(prev => prev.map(acc =>
        acc.id === accountId
        ? { ...acc, status: newStatus, lastLogin: 'Just now', errorContext }
        : acc
    ));
    addToast({ type: 'success', message: 'Account status has been updated.' });
  }, [accounts, addToast]);
  
  const handleUpdateLimit = useCallback((accountId, newLimit) => {
      setAccounts(prev => prev.map(acc =>
          acc.id === accountId
          ? { ...acc, dailyLimit: newLimit }
          : acc
      ));
      addToast({ type: 'success', message: 'Daily limit updated successfully.' });
  }, [addToast]);

  const handleOpenEditProxyModal = (account) => {
    setEditingAccount(account);
    setIsEditProxyModalOpen(true);
  };
  
  const handleUpdateProxy = (accountId, newProxyData) => {
      setAccounts(prev => prev.map(acc =>
          acc.id === accountId
          ? { ...acc, proxy: newProxyData, errorContext: null }
          : acc
      ));
      addToast({ type: 'success', message: 'Proxy configuration updated.' });
      setIsEditProxyModalOpen(false);
      setEditingAccount(null);
      // Automatically refresh status after updating proxy
      setTimeout(() => handleRefreshStatus(accountId), 500);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || account.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const statusFilters = ['all', 'active', 'connecting', 'restricted', 'inactive'];

  return (
    <div className="dashboard page">
      {isModalOpen && <AddTelegramAccountModal onClose={() => setIsModalOpen(false)} onAddAccount={handleAddAccount} apiConfig={apiConfig} />}
      {isEditProxyModalOpen && editingAccount && (
          <EditProxyModal 
              account={editingAccount}
              onClose={() => setIsEditProxyModalOpen(false)}
              onSave={handleUpdateProxy}
          />
      )}
      
      <header className="dashboard-header">
        <div className="header-title-group">
            <button className="btn btn-icon btn-back" onClick={onBack} aria-label="Go Back"><BackIcon /></button>
            <h1>Telegram Accounts <span>({accounts.length})</span></h1>
        </div>
        <div className="header-actions">
            <button className="btn btn-primary" onClick={handleOpenAddAccountModal}>
              + Add New Account
            </button>
        </div>
      </header>
      
      <div className="actions-bar">
         <div className="search-bar">
             <input type="text" placeholder="Search by phone number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
         </div>
        <div className="btn-group filter-group">
            {statusFilters.map(filter => (
                 <button key={filter} className={`btn btn-secondary ${statusFilter === filter ? 'active' : ''}`} onClick={() => setStatusFilter(filter)}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                 </button>
            ))}
        </div>
      </div>
      
      <main className="account-list">
        {filteredAccounts.map(account => (
          <AccountCard 
              key={account.id} 
              account={account} 
              onDelete={handleDeleteAccount} 
              onToggle={handleToggleAccount}
              onToggleHumanize={handleToggleHumanize} 
              onRefresh={handleRefreshStatus} 
              onUpdateLimit={handleUpdateLimit}
              onEditProxy={handleOpenEditProxyModal}
              isHumanizationActive={humanizationConfig.isEnabled}
          />
        ))}
        {accounts.length > 0 && filteredAccounts.length === 0 && (
             <div className="empty-state"><h2>No Matching Accounts</h2><p>No accounts match your current search and filter criteria.</p></div>
        )}
        {accounts.length === 0 && (
            <div className="empty-state"><h2>No Accounts Found</h2><p>Click "+ Add New Account" to get started.</p></div>
        )}
      </main>
    </div>
  );
};

export default TelegramDashboard;