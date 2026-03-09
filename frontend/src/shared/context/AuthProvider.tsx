import { useState, useEffect, ReactNode } from 'react';
import { User } from '../types/api';
import { vendorApi } from '../api/vendorApi';
import { AuthContext } from './AuthContext';

/**
 * AuthProvider Component
 * 
 * Manages the global authentication state.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Initial session hydration
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        const hydrate = async () => {
            if (storedToken) {
                if (!storedUser || storedUser === 'undefined') {
                    try {
                        const profile = await vendorApi.getProfile();
                        if (profile && profile.id) {
                            setUser(profile);
                            localStorage.setItem('user', JSON.stringify(profile));
                        }
                    } catch {
                        // Clear broken session if profile load fails
                        setToken(null);
                        setUser(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else {
                    try {
                        const parsed = JSON.parse(storedUser);
                        if (parsed && parsed.id) {
                            setUser(parsed);
                        }
                    } catch {
                        localStorage.removeItem('user');
                    }
                }
            }
            setIsLoading(false);
        };

        hydrate();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = (redirectPath?: string) => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = redirectPath || '/login';
    };

    const role = user?.role || null;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading session...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout, role, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}
