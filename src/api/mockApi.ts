// Shared function for testing proxy connections
const testProxyConnection = async (proxy) => {
    console.log('API: Testing proxy connection:', proxy);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (!proxy || !proxy.hostname || !proxy.port) {
        return { success: false, error: 'incomplete_details', message: 'Hostname and Port are required.' };
    }

    const random = Math.random();
    if (random < 0.6) { // 60% success
        console.log('API: Proxy test successful.');
        return { success: true, message: 'Connection successful!' };
    } else if (random < 0.8) { // 20% auth failure
        console.warn('API: Simulating proxy auth failure.');
        return { success: false, error: 'authentication_failed', message: 'Authentication failed. Check username/password.' };
    } else if (random < 0.9) { // 10% host not found
        console.warn('API: Simulating proxy host not found.');
        return { success: false, error: 'host_not_found', message: 'Host not found. Check hostname/IP.' };
    } else { // 10% timeout
        console.warn('API: Simulating proxy timeout.');
        return { success: false, error: 'timeout', message: 'Connection timed out.' };
    }
};

const DUMMY_QR_SVG = '<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="qr-code-svg"><rect width="200" height="200" fill="white"/><rect x="30" y="30" width="45" height="45" fill="#1A1C2C"/><rect x="37" y="37" width="31" height="31" fill="white"/><rect x="44" y="44" width="17" height="17" fill="#1A1C2C"/><rect x="125" y="30" width="45" height="45" fill="#1A1C2C"/><rect x="132" y="37" width="31" height="31" fill="white"/><rect x="139" y="44" width="17" height="17" fill="#1A1C2C"/><rect x="30" y="125" width="45" height="45" fill="#1A1C2C"/><rect x="37" y="132" width="31" height="31" fill="white"/><rect x="44" y="139" width="17" height="17" fill="#1A1C2C"/><path fill="#1A1C2C" d="M85 30h10v10H85z M95 40h10v10H95z M105 30h10v10h-10z M85 50h10v10H85z M105 50h10v10h-10z M85 70h10v10H85z M95 60h10v10H95z M105 70h10v10h-10z M30 85h10v10H30z M40 95h10v10H40z M50 85h10v10H50z M30 105h10v10H30z M50 105h10v10H50z M85 85h10v10H85z M95 95h10v10H95z M105 85h10v10h-10z M115 95h10v10h-10z M85 105h10v10H85z M95 115h10v10H95z M105 105h10v10h-10z M125 85h10v10h-10z M135 95h10v10h-10z M145 85h10v10h-10z M155 95h10v10h-10z M125 105h10v10h-10z M145 105h10v10h-10z M85 125h10v10H85z M95 135h10v10H95z M105 125h10v10h-10z M115 135h10v10h-10z M85 145h10v10H85z M95 155h10v10H95z M105 145h10v10h-10z M125 125h10v10h-10z M135 135h10v10h-10z M145 125h10v10h-10z M155 135h10v10h-10z M125 145h10v10h-10z M135 155h10v10h-10z M145 145h10v10h-10z"/></svg>';

// --- TELEGRAM API ---
const checkTelegramProxyStatus = (account) => {
    if (account.proxy && account.proxy.hostname) {
        const random = Math.random();
        if (random < 0.3) { // 30% chance of failure
            const errors = ['proxy_auth_failed', 'proxy_host_not_found', 'proxy_timeout'];
            const errorContext = errors[Math.floor(Math.random() * errors.length)];
            console.warn(`API: Simulating Telegram proxy failure (${errorContext}) for account ${account.id}`);
            return { status: 'inactive', errorContext };
        }
    }
    return null; // No proxy issue
}

export const mockTelegramApi = {
  validateApiCredentials: async (apiId, apiHash) => {
    console.log('API: Validating Telegram API credentials...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (apiId && apiHash) {
      console.log('API: Mock validation successful for provided credentials.');
      return { success: true };
    }
    console.error('API: Credentials validation failed (inputs were empty).');
    throw new Error('API ID and API Hash cannot be empty.');
  },
  loginWithOtp: async (apiId, apiHash, phone, proxy) => {
    console.log('API: Requesting OTP for', phone, 'using API ID', apiId);
    if (proxy && proxy.hostname) {
        console.log('API: Using Proxy:', proxy);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (phone.length < 10) throw new Error('Invalid phone number provided.');
    console.log('API: OTP request successful.');
    return { success: true };
  },
  submitOtp: async (otp) => {
    console.log('API: Verifying OTP', otp);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (otp !== '12345') throw new Error('Invalid OTP code. Please try again.');
    console.log('API: OTP verified. Checking for 2FA.');
    return { needs2fa: true };
  },
  submitPassword: async (password) => {
    console.log('API: Verifying 2FA password.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (password !== 'password') throw new Error('Incorrect password.');
    console.log('API: 2FA password verified. Login successful.');
    return { success: true };
  },
  getQrCode: async (apiId, apiHash, phone, proxy) => {
    console.log('API: Generating QR code for', phone, 'using API ID', apiId);
    if (proxy && proxy.hostname) {
        console.log('API: Using Proxy:', proxy);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!apiId || !apiHash) throw new Error('API ID and API Hash are required.');
    console.log('API: QR Code generated.');
    return { qrCodeSvg: DUMMY_QR_SVG, sessionId: `tg_qr_${Date.now()}`, countdown: 30 };
  },
  confirmQrScan: async (sessionId) => {
     console.log('API: Confirming scan for session', sessionId);
     await new Promise(resolve => setTimeout(resolve, 2500));
     // Simulate QR code expiration
     if (Math.random() < 0.4) { // 40% chance of expiring
        console.warn('API: Simulating QR code expiration.');
        throw { success: false, error: 'QR_CODE_EXPIRED', message: 'The QR code has expired.' };
     }
     console.log('API: QR Code scan confirmed by user.');
     return { success: true };
  },
  checkAccountStatus: async (account) => {
    console.log(`API: Checking status for account ${account.id}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const proxyFailure = checkTelegramProxyStatus(account);
    if (proxyFailure) return proxyFailure;

    const isOk = Math.random() > 0.2; // 80% chance of being active
    const newStatus = isOk ? 'active' : 'restricted';
    console.log(`API: New status for ${account.id} is ${newStatus}`);
    return { status: newStatus, errorContext: null };
  },
  testProxyConnection,
  testGeminiApiKey: async (apiKey) => {
    console.log('API: Testing Gemini API Key...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (apiKey && apiKey.trim().length > 10) { // Simple check for non-empty string
      console.log('API: Gemini API Key test successful.');
      return { success: true, message: 'Connection successful!' };
    }
    console.warn('API: Gemini API Key test failed.');
    return { success: false, message: 'Invalid API Key.' };
  },
};


// --- WHATSAPP API ---
const checkWhatsappProxyStatus = (account) => {
    if (account.proxy && account.proxy.hostname) {
        const random = Math.random();
        if (random < 0.3) { // 30% chance of failure
            const errors = ['proxy_auth_failed', 'proxy_host_not_found', 'proxy_timeout'];
            const errorContext = errors[Math.floor(Math.random() * errors.length)];
            console.warn(`WHATSAPP API: Simulating proxy failure (${errorContext}) for account ${account.id}`);
            return { status: 'inactive', errorContext };
        }
    }
    return null; // No proxy issue
}

export const mockWhatsappApi = {
    getQrCode: async (proxy) => {
        console.log('WHATSAPP API: Generating QR code...');
         if (proxy && proxy.hostname) {
            console.log('WHATSAPP API: Using Proxy:', proxy);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('WHATSAPP API: QR Code generated.');
        return { sessionId: `wa_qr_${Date.now()}`, qrCodeSvg: DUMMY_QR_SVG, countdown: 30 };
    },
    confirmQrScan: async (sessionId) => {
        console.log('WHATSAPP API: Confirming scan for session', sessionId);
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Simulate QR code expiration
        if (Math.random() < 0.4) { // 40% chance of expiring
            console.warn('WHATSAPP API: Simulating QR code expiration.');
            throw { success: false, error: 'QR_CODE_EXPIRED', message: 'The QR code has expired.' };
        }

        console.log('WHATSAPP API: QR Code scan confirmed by user.');
        return { success: true, phone: `+${Math.floor(1000000000 + Math.random() * 9000000000)}` };
    },
    checkAccountStatus: async (account) => {
        console.log(`WHATSAPP API: Checking status for account ${account.id}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const proxyFailure = checkWhatsappProxyStatus(account);
        if (proxyFailure) return proxyFailure;

        const isOk = Math.random() > 0.15; // 85% chance of being active
        const newStatus = isOk ? 'active' : 'inactive'; // WhatsApp is either active or not
        console.log(`WHATSAPP API: New status for ${account.id} is ${newStatus}`);
        return { status: newStatus, errorContext: null };
    },
    testProxyConnection,
};


// --- INITIAL DATA ---
export const initialTelegramAccounts = [
  { id: 1, phone: '+1234567890', status: 'active', lastLogin: '2 hours ago', isEnabled: true, isHumanized: true, dailyUsage: 750, dailyLimit: 3000, proxy: null, errorContext: null },
  { id: 2, phone: '+628123456789', status: 'inactive', lastLogin: '5 minutes ago', isEnabled: true, isHumanized: false, dailyUsage: 2800, dailyLimit: 3000, proxy: { protocol: 'SOCKS5', hostname: 'proxy.example.com', port: '1080', username: 'user123', password: '' }, errorContext: 'proxy_auth_failed' },
  { id: 3, phone: '+998901234567', status: 'restricted', lastLogin: '15 seconds ago', isEnabled: true, isHumanized: true, dailyUsage: 1950, dailyLimit: 2000, proxy: null, errorContext: null },
  { id: 4, phone: '+447123456789', status: 'active', lastLogin: '1 day ago', isEnabled: false, isHumanized: true, dailyUsage: 250, dailyLimit: 5000, proxy: null, errorContext: null },
];

export const initialWhatsappAccounts = [
    { id: 1, phone: '+6289876543210', status: 'active', lastLogin: '1 hour ago', isEnabled: true, dailyUsage: 1200, dailyLimit: 2500, proxy: null, errorContext: null },
    { id: 2, phone: '+19876543210', status: 'inactive', lastLogin: 'Just now', isEnabled: true, dailyUsage: 300, dailyLimit: 1500, proxy: { protocol: 'HTTP', hostname: 'wa-proxy.net', port: '8080', username: 'wa-user', password: '' }, errorContext: 'proxy_timeout' },
];