// src/utils/api.ts
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${window.location.origin}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please ensure the server is running.');
    }
    throw error;
  }
}