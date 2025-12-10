import React, { useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { user, logOut, updateUserProfile, updateUserEmail, updateUserPassword } = UserAuth();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            if (displayName !== user.displayName || photoURL !== user.photoURL) {
                await updateUserProfile({ displayName, photoURL });
            }
            if (email !== user.email) {
                await updateUserEmail(email);
            }
            if (password) {
                await updateUserPassword(password);
            }
            setMessage('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setError('Failed to update profile. ' + err.message);
        }
    };

    return (
        <div className='w-full text-white'>
            <img
                className='w-full h-[400px] object-cover'
                src='https://assets.nflxext.com/ffe/siteui/vlv3/f841d4c7-10e1-40af-bcae-07a3f8dc141a/f6d7434e-d6de-4185-a6d4-c77a2d08737b/US-en-20220502-popsignuptwoweeks-perspective_alpha_website_medium.jpg'
                alt='/'
            />
            <div className='bg-black/60 fixed top-0 left-0 w-full h-[550px]'></div>
            <div className='absolute top-[20%] p-4 md:p-8 w-full max-w-[600px]'>
                <h1 className='text-3xl md:text-5xl font-bold mb-8'>My Account</h1>

                {message && <p className='p-3 bg-green-500 my-2 rounded'>{message}</p>}
                {error && <p className='p-3 bg-red-500 my-2 rounded'>{error}</p>}

                {!editing ? (
                    <div>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='w-20 h-20 bg-gray-500 rounded overflow-hidden'>
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className='w-full h-full object-cover' />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-2xl'>
                                        {user?.email?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className='text-2xl font-bold'>{user?.displayName || 'User'}</h2>
                                <p className='text-gray-400'>{user?.email}</p>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <button
                                onClick={() => setEditing(true)}
                                className='bg-white text-black px-6 py-2 font-bold rounded hover:bg-gray-200 transition'
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className='border border-gray-500 px-6 py-2 font-bold rounded hover:bg-gray-900 transition'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className='bg-black/80 p-8 rounded'>
                        <div className='flex flex-col gap-4'>
                            <div>
                                <label className='block text-gray-400 text-sm mb-1'>Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className='w-full p-3 bg-gray-700 rounded text-white'
                                />
                            </div>
                            <div>
                                <label className='block text-gray-400 text-sm mb-1'>Photo URL</label>
                                <input
                                    type="text"
                                    value={photoURL}
                                    onChange={(e) => setPhotoURL(e.target.value)}
                                    className='w-full p-3 bg-gray-700 rounded text-white'
                                    placeholder="https://example.com/photo.jpg"
                                />
                            </div>
                            <div>
                                <label className='block text-gray-400 text-sm mb-1'>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='w-full p-3 bg-gray-700 rounded text-white'
                                />
                            </div>
                            <div>
                                <label className='block text-gray-400 text-sm mb-1'>New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full p-3 bg-gray-700 rounded text-white'
                                    placeholder="New Password"
                                />
                            </div>

                            <div className='flex gap-4 mt-4'>
                                <button
                                    type="submit"
                                    className='bg-red-600 px-6 py-2 font-bold rounded hover:bg-red-700 transition'
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className='border border-gray-500 px-6 py-2 font-bold rounded hover:bg-gray-800 transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Account;
