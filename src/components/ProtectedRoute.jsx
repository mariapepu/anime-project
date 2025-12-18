import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = UserAuth();

    if (loading) {
        return null; // Or a spinner, though AuthContext handles global loading
    }

    if (!user) {
        return <Navigate to='/login' />;
    }
    return children;
};

export default ProtectedRoute;
