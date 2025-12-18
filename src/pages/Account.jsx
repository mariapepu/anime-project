import React, { useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import defaultBanner from '../assets/profile_default_banner.png';
import Navbar from '../components/Navbar';

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
    const [bannerURL, setBannerURL] = useState('');
    const [savedBanner, setSavedBanner] = useState('');
    const [myList, setMyList] = useState([]);

    // Fetch user data from Firestore for extra fields like bannerURL
    React.useEffect(() => {
        const fetchUserData = async () => {
            if (user?.email) {
                try {
                    const docRef = doc(db, 'users', user.email);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.bannerURL) {
                            setSavedBanner(data.bannerURL);
                            setBannerURL(data.bannerURL);
                        }
                    }
                } catch (err) {
                    console.log("Error fetching user data:", err);
                }

                // Fetch My List
                try {
                    const querySnapshot = await getDocs(collection(db, 'users', user.email, 'savedShows'));
                    const listData = querySnapshot.docs.map(doc => doc.data());
                    setMyList(listData);
                } catch (err) {
                    console.log("Error fetching my list:", err);
                }
            }
        };
        fetchUserData();
    }, [user]);

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

            // Update Firestore for bannerURL
            const userRef = doc(db, 'users', user.email);
            // Check if doc exists first, if not setDoc, else updateDoc
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
                await setDoc(userRef, { bannerURL: bannerURL }, { merge: true });
            } else {
                await updateDoc(userRef, { bannerURL: bannerURL });
            }
            setSavedBanner(bannerURL);

            setMessage('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setError('Failed to update profile. ' + err.message);
        }
    };

    return (
        <div className='w-full text-white bg-[#141414] min-h-screen'>
            <Navbar />
            <div className='relative w-full h-[450px]'>
                <img
                    className='w-full h-full object-cover object-bottom'
                    src={savedBanner || defaultBanner}
                    alt='/'
                />
                <div className='absolute w-full h-full top-0 left-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent'></div>
            </div>
            <div className='px-[4%] py-8 relative -mt-32 z-20'>
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
                                className='bg-[var(--primary)] text-black px-6 py-2 font-bold rounded hover:bg-opacity-80 transition'
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className='bg-[#9c7880]/90 text-white px-6 py-2 font-bold rounded hover:bg-[#8a6a72] transition'
                            >
                                Logout
                            </button>
                        </div>

                        {/* My List Section in Account */}
                        <div className='mt-12'>
                            <h2 className='text-2xl font-bold mb-4'>My List</h2>
                            <div className='flex overflow-x-scroll whitespace-nowrap scrollbar-hide gap-4 pb-4'>
                                {myList.map((item, id) => (
                                    <div
                                        key={id}
                                        className='w-[160px] sm:w-[200px] inline-block cursor-pointer relative p-2 anime-card'
                                        onClick={() => navigate(`/title/${item.id}`)}
                                    >
                                        <img
                                            className='w-full h-auto block rounded anime-image'
                                            src={item.image}
                                            alt={item.title}
                                        />
                                        <p className='text-sm mt-2 text-gray-300 truncate'>{item.title}</p>
                                    </div>
                                ))}
                                {myList.length === 0 && (
                                    <p className='text-gray-500'>Your list is empty.</p>
                                )}
                            </div>
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
                                <label className='block text-gray-400 text-sm mb-1'>Banner URL</label>
                                <input
                                    type="text"
                                    value={bannerURL}
                                    onChange={(e) => setBannerURL(e.target.value)}
                                    className='w-full p-3 bg-gray-700 rounded text-white'
                                    placeholder="https://example.com/banner.jpg"
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
                                    className='bg-[var(--primary)] text-black px-6 py-2 font-bold rounded hover:bg-opacity-80 transition'
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
