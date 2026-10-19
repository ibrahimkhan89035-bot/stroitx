export const API_BASE = '/api';

const inFlightGetRequests = new Map<string, Promise<any>>();

async function executeFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; error?: any }> {
  const defaultHeaders: Record<string, string> = {};

  // Only set Content-Type for non-FormData requests
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('stroitx_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(isFormData ? {} : options.headers),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  let json: any;

  if (contentType.includes('application/json')) {
    json = await response.json();
  } else {
    const text = await response.text();
    console.error('[API Non-JSON Response Text]:', text);
    throw new Error('Backend service connection issue. Please verify backend server on port 5000 is running.');
  }

  if (!response.ok) {
    throw new Error(json.message || 'API Request Failed');
  }

  return json;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; message: string; data?: T; error?: any }> {
  const method = (options.method || 'GET').toUpperCase();

  // In-flight GET request deduplication (prevents duplicate simultaneous API spam on re-renders)
  if (method === 'GET') {
    const cacheKey = `${endpoint}_${localStorage.getItem('stroitx_token') || ''}`;
    if (inFlightGetRequests.has(cacheKey)) {
      return inFlightGetRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        return await executeFetch<T>(endpoint, options);
      } finally {
        setTimeout(() => {
          inFlightGetRequests.delete(cacheKey);
        }, 500);
      }
    })();

    inFlightGetRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  return executeFetch<T>(endpoint, options);
}
