import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from '@/shared/context/AuthProvider'
import './index.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { APP_CONFIG } from '@/config'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={APP_CONFIG.GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <div className="min-h-screen bg-gray-50">
                        <AuthProvider>
                            <App />
                        </AuthProvider>
                    </div>
                </BrowserRouter>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
