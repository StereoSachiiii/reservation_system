import axios, { AxiosError } from 'axios'
import { ApiError, ErrorDetails } from '../types/api'
import { APP_CONFIG } from '@/config'

/**
 * Axios instance configured for the backend API
 * The Vite dev server proxies /api/v1 to localhost:8080
 */
const api = axios.create({
    baseURL: APP_CONFIG.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor: Injects the token into every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Global Response Interceptor
api.interceptors.response.use(
    (response) => {
        // V4.5: Unwrap "content" from PageEnvelope if it exists
        if (response.data && response.data.content && Array.isArray(response.data.content)) {
            return response;
        }
        return response;
    },
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean });
        const status = error.response?.status;
        const apiError = error.response?.data;

        // Offline / Network Check
        if (error.code === 'ERR_NETWORK' || !error.response) {
            return Promise.reject(new Error("Unable to connect to the server. Please check your internet connection."));
        }

        // Automatic Refresh Token Flow on 401 Unauthorized
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
            originalRequest?.url?.includes('/auth/google-login') ||
            originalRequest?.url?.includes('/auth/refresh-token') ||
            originalRequest?.url?.includes('/auth/register');

        if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            resolve: (newToken: string) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                }
                                resolve(api(originalRequest));
                            },
                            reject: (err) => reject(err),
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    // Bypass interceptors using clean axios post to prevent recursive loop
                    const refreshResponse = await axios.post<{ token: string; refreshToken?: string }>(
                        `${APP_CONFIG.API_BASE_URL}/auth/refresh-token`,
                        { refreshToken },
                        { headers: { 'Content-Type': 'application/json' } }
                    );

                    const { token: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                    localStorage.setItem('token', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    processQueue(null, newAccessToken);
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');

                    const isAdmin = window.location.pathname.startsWith('/admin');
                    window.location.href = isAdmin ? '/admin/login' : '/login';
                    return Promise.reject(new Error("Session expired. Please log in again."));
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Auto-logout on stale/forbidden session (401 without refresh token or 403 Forbidden)
        if (status === 401 || status === 403) {
            if (!isAuthEndpoint) {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                const isAdmin = window.location.pathname.startsWith('/admin');
                window.location.href = isAdmin ? '/admin/login' : '/login';
                return Promise.reject(new Error("Session expired or access denied. Please login again."));
            }
        }

        // V4.5: Structured Error Handling
        if (apiError && apiError.message) {
            // Dictionary of User-Friendly Messages
            const errorMap: Record<string, string> = {
                'LIMIT_EXCEEDED': 'You have reached the maximum booking limit (3 stalls).',
                'TAXONOMY_DENIED': 'Your business category is not allowed in this specific hall/zone.',
                'RESOURCE_CONFLICT': 'One or more selected stalls have just been booked by another user. Please refresh.', // not needed anymore because pubsub
                'DUPLICATE_SCAN': 'This ticket has already been used/checked-in.',
                'NOT_PAID': 'This reservation is PENDING PAYMENT. Please collect payment first.',
                'INVALID_QR': 'The QR code is invalid or does not belong to this event.',
                'EVENT_CLOSED': 'Booking for this event is currently closed.',
                'ILLEGAL_STATE': 'This action is not allowed in the current state.',
                'BAD_CREDENTIALS': 'Invalid username or password.',
                'ACCOUNT_LOCKED': 'Your account has been locked due to too many failed attempts.',
                'NETWORK_ERROR': 'Unable to connect to server. Please check your internet.'
            };

            let friendlyMessage = errorMap[apiError.code] || apiError.message;

            // Preserve backend duplicate user/email conflict messages
            if (apiError.code === 'RESOURCE_CONFLICT' && apiError.message && (apiError.message.includes('Username') || apiError.message.includes('Email'))) {
                friendlyMessage = apiError.message;
            }

            // Append details if useful (e.g. which stall caused the conflict)
            if (apiError.code === 'TAXONOMY_DENIED' && apiError.details?.allowed) {
                friendlyMessage += ` (Allowed: ${apiError.details.allowed})`;
            }

            // Attach the full error object for UI components to read 'details'
            interface EnhancedError extends Error {
                details?: ErrorDetails;
                code?: string;
            }
            const enhancedError = new Error(friendlyMessage) as EnhancedError;
            enhancedError.details = apiError.details;
            enhancedError.code = apiError.code;
            return Promise.reject(enhancedError);
        }

        return Promise.reject(new Error(error.message || 'An unexpected network error occurred'));
    }
);

export default api
