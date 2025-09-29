const API_BASE_URL = 'https://phonecheck.gen-ai.fun';

async function handleResponse(response: Response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown network error occurred.' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    return response.json();
}

async function post(endpoint: string, body: object) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return handleResponse(response);
}

export const apiClient = {
    // Telegram API calls
    telegramSendCode: (apiId: string, apiHash: string, phone: string, proxy: any) => {
        return post('/api/telegram/send_code', { apiId, apiHash, phone, proxy });
    },
    telegramSubmitCode: (phone: string, otp: string) => {
        return post('/api/telegram/submit_code', { phone, otp });
    },
    telegramSubmitPassword: (phone: string, password: string) => {
        return post('/api/telegram/submit_password', { phone, password });
    },
};