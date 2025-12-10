import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword,
    onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
    const [user, setUser] = useState({});

    function signUp(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function logIn(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logOut() {
        return signOut(auth);
    }

    function updateUserProfile(profileData) {
        return updateProfile(auth.currentUser, profileData);
    }

    function updateUserEmail(email) {
        return updateEmail(auth.currentUser, email);
    }

    function updateUserPassword(password) {
        return updatePassword(auth.currentUser, password);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ signUp, logIn, logOut, updateUserProfile, updateUserEmail, updateUserPassword, user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function UserAuth() {
    return useContext(AuthContext);
}
