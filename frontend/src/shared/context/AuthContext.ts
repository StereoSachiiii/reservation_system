import { createContext, useContext } from 'react';
import { User } from '../types/api';

/**
 * Authentication Context Type Definition
 */
export interface AuthContextType {
    /** The currently authenticated user object */
    user: User | null;
    /** The JWT authentication token */
    token: string | null;
    /**
     * Function to log in a user
     * @param token - The JWT token received from the backend
     * @param user - The user object received from the backend
     */
    login: (token: string, user: User) => void;
    /** Function to log out the current user */
    logout: (redirectPath?: string) => void;
    /** Boolean indicating if a user is currently authenticated */
    role: 'ADMIN' | 'VENDOR' | 'EMPLOYEE' | null;
    /** Boolean indicating if a user is currently authenticated */
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 *
 * Custom hook to consume the AuthContext easily within components.
 * Throws an error if used outside of an AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
