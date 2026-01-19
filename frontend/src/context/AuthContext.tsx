import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
    user: User | null;
    viewMode: 'admin' | 'user' | null;
    isLoading: boolean;
    isProcessing: boolean;
    loginUser: (phone: string, password: string) => Promise<{ success: boolean; role?: string; userData?: User }>;
    setViewMode: (mode: 'admin' | 'user') => void;
    completeLogin: (userData: User, mode: 'admin' | 'user') => Promise<void>;
    registerUser: (phone: string, password: string, name?: string, address?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User>) => Promise<boolean>;
    changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

interface AuthResponse {
    token: string;
    user: {
        id: string;
        phone: string;
        name: string;
        role: string;
        address: string;
        createdAt: any;
    };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [viewMode, setViewModeState] = useState<'admin' | 'user' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Optionally verify token with backend here
                setUser(parsedUser);
            }
        } catch (e) {
            console.log('Error loading user', e);
        } finally {
            setIsLoading(false);
        }
    };

    const registerUser = async (phone: string, password: string, name?: string, address?: string): Promise<boolean> => {
        setIsProcessing(true);
        try {
            const response = await api.post<AuthResponse>('/auth/register', {
                phone,
                password,
                name,
                address
            });

            if (response && response.user) {
                const newUser: User = {
                    ...response.user,
                    role: response.user.role as Role,
                    token: response.token // Add token to user object for storage
                };

                await AsyncStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                return true;
            }
            return false;

        } catch (error: any) {
            console.error('Registration error:', error);
            alert(error.message || 'Kayıt işlemi başarısız.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const loginUser = async (phone: string, password: string): Promise<{ success: boolean; role?: string; userData?: User }> => {
        setIsProcessing(true);
        try {
            const response = await api.post<AuthResponse>('/auth/login', {
                phone,
                password
            });

            if (response && response.user) {
                const userData: User = {
                    ...response.user,
                    role: response.user.role as Role,
                    token: response.token
                };
                return { success: true, role: userData.role, userData };
            }
            return { success: false };

        } catch (error: any) {
            console.error('Login error:', error);
            alert(error.message || 'Giriş yapılamadı.');
            return { success: false };
        } finally {
            setIsProcessing(false);
        }
    };

    const completeLogin = async (userData: User, mode: 'admin' | 'user') => {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setViewModeState(mode);
    };

    // Consolidated admin login to use the same endpoint but check role
    const loginAdmin = async (password: string, phone?: string): Promise<boolean> => {
        setIsProcessing(true);
        try {
            if (!phone) {
                alert('Yönetici girişi için telefon numarası gereklidir.');
                return false;
            }

            const response = await api.post<AuthResponse>('/auth/login', {
                phone,
                password
            });

            if (response && response.user) {
                if (response.user.role !== 'admin') {
                    alert('Bu hesap yönetici yetkisine sahip değil.');
                    return false;
                }

                const loggedInUser: User = {
                    ...response.user,
                    role: 'admin',
                    token: response.token
                };

                await completeLogin(loggedInUser, 'admin');
                return true;
            }
            return false;

        } catch (error: any) {
            console.error('Admin login error:', error);
            alert(error.message || 'Yönetici girişi başarısız.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('user');
        setUser(null);
        setViewModeState(null); // Critical: Reset view mode to prevent next user inheriting admin view
    };

    const updateUser = async (updates: Partial<User>): Promise<boolean> => {
        if (!user) return false;

        setIsProcessing(true);
        try {
            // Call backend to update profile
            const updatedUserResponse = await api.put<User>('/auth/profile', updates);

            // Merge response with current user state (preserving token etc)
            const updatedUser = { ...user, ...updatedUserResponse, token: user.token };

            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            return true;
        } catch (error: any) {
            console.error("Error updating user: ", error);
            alert(error.message || 'Profil güncellenemedi.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
        setIsProcessing(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: oldPass,
                newPassword: newPass
            });
            alert('Şifreniz başarıyla değiştirildi.');
            return true;
        } catch (error: any) {
            console.error('Change password error:', error);
            alert(error.message || 'Şifre değiştirilemedi.');
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            viewMode,
            isLoading,
            isProcessing,
            loginUser,
            loginAdmin,
            registerUser,
            logout,
            updateUser,
            changePassword,
            completeLogin,
            setViewMode: setViewModeState
        }}>
            {children}
        </AuthContext.Provider>
    );
};
