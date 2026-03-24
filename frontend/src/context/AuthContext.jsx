import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    loginUser,
    registerUser,
    getProfile,
    updateProfileAPI,
    saveAuthData,
    clearAuthData,
    getToken,
    getStoredUser
} from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());
    const [token, setToken] = useState(getToken());
    const [loading, setLoading] = useState(true);

    // Au montage, vérifier si le token stocké est encore valide
    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = getToken();
            if (storedToken) {
                try {
                    const data = await getProfile();
                    setUser(data.user);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Token invalide, déconnexion...', error);
                    clearAuthData();
                    setUser(null);
                    setToken(null);
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    // Connexion
    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        if (data.success) {
            saveAuthData(data.token, data.user);
            setUser(data.user);
            setToken(data.token);
        }
        return data;
    };

    // Inscription
    const register = async (userData) => {
        const data = await registerUser(userData);
        if (data.success) {
            saveAuthData(data.token, data.user);
            setUser(data.user);
            setToken(data.token);
        }
        return data;
    };

    // Mise à jour du profil
    const updateProfile = async (profileData) => {
        const data = await updateProfileAPI(profileData);
        if (data.success) {
            setUser(data.user);
            saveAuthData(token, data.user);
        }
        return data;
    };

    // Déconnexion
    const logout = () => {
        clearAuthData();
        setUser(null);
        setToken(null);
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.isAdmin === true;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            updateProfile,
            logout,
            isAuthenticated,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
