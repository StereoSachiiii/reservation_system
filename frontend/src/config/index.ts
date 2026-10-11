export const APP_CONFIG = {
    API_BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_KEY || '',
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '892174316353-0e5rlmnujn37u6vup7a1m2is1ft89rvq.apps.googleusercontent.com',
    OIDC_SCOPES: 'openid email profile',
    DEMO_EVENT_ID: 5001,
    APP_NAME: 'StereoSachiiii',
};

export const ROLES = {
    ADMIN: 'ADMIN',
    VENDOR: 'VENDOR',
    EMPLOYEE: 'EMPLOYEE',
} as const;
