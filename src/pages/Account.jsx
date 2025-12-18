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
    const [bannerPosition, setBannerPosition] = useState({ x: 50, y: 100 });
    const [bannerZoom, setBannerZoom] = useState(1);
    const [photoPosition, setPhotoPosition] = useState({ x: 50, y: 50 });
    const [photoZoom, setPhotoZoom] = useState(1);
    const [cropperTarget, setCropperTarget] = useState(null); // 'banner' or 'photo'
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
                        if (data.bannerPosition !== undefined) {
                            if (typeof data.bannerPosition === 'number') {
                                setBannerPosition({ x: 50, y: data.bannerPosition });
                            } else {
                                setBannerPosition(data.bannerPosition);
                            }
                        }
                        if (data.bannerZoom !== undefined) {
                            setBannerZoom(data.bannerZoom);
                        }
                        if (data.photoPosition !== undefined) {
                            setPhotoPosition(data.photoPosition);
                        }
                        if (data.photoZoom !== undefined) {
                            setPhotoZoom(data.photoZoom);
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
            const docSnap = await getDoc(userRef);
            const updateData = {
                bannerURL: bannerURL,
                bannerPosition: bannerPosition,
                bannerZoom: bannerZoom,
                photoPosition: photoPosition,
                photoZoom: photoZoom
            };

            if (!docSnap.exists()) {
                await setDoc(userRef, updateData, { merge: true });
            } else {
                await updateDoc(userRef, updateData);
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
            <div className='relative w-full h-[450px] overflow-hidden'>
                <img
                    className='absolute object-cover'
                    src={savedBanner || defaultBanner}
                    alt='/'
                    style={{
                        width: `${savedBanner ? bannerZoom * 100 : 100}%`,
                        height: `${savedBanner ? bannerZoom * 100 : 100}%`,
                        top: `${savedBanner ? bannerPosition.y : 100}%`,
                        left: `${savedBanner ? bannerPosition.x : 50}%`,
                        transform: `translate(-${savedBanner ? bannerPosition.x : 50}%, -${savedBanner ? bannerPosition.y : 100}%)`,
                        objectPosition: savedBanner ? `${bannerPosition.x}% ${bannerPosition.y}%` : 'center bottom'
                    }}
                />
                <div className='absolute w-full h-full top-0 left-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent'></div>
            </div>
            <div className='px-[4%] py-8 relative -mt-32 z-20 w-full max-w-[600px]'>
                <h1 className='text-3xl md:text-5xl font-bold mb-8'>My Account</h1>

                {message && <p className='p-3 bg-green-500 my-2 rounded'>{message}</p>}
                {error && <p className='p-3 bg-red-500 my-2 rounded'>{error}</p>}

                {!editing ? (
                    <div>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='w-20 h-20 bg-gray-500 rounded overflow-hidden relative'>
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className='absolute object-cover'
                                        style={{
                                            width: `${photoZoom * 100}%`,
                                            height: `${photoZoom * 100}%`,
                                            top: `${photoPosition.y}%`,
                                            left: `${photoPosition.x}%`,
                                            transform: `translate(-${photoPosition.x}%, -${photoPosition.y}%)`,
                                            objectPosition: `${photoPosition.x}% ${photoPosition.y}%`
                                        }}
                                    />
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
                                {photoURL && (
                                    <button
                                        type="button"
                                        onClick={() => setCropperTarget('photo')}
                                        className="mt-2 text-sm text-[var(--primary)] hover:underline"
                                    >
                                        Adjust Photo Position
                                    </button>
                                )}
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
                                {bannerURL && (
                                    <button
                                        type="button"
                                        onClick={() => setCropperTarget('banner')}
                                        className="mt-2 text-sm text-[var(--primary)] hover:underline"
                                    >
                                        Adjust Banner Position
                                    </button>
                                )}
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

            {/* Positioning Modal */}
            {cropperTarget && (
                <div className='fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4'>
                    <div className='bg-[#181818] w-full max-w-[800px] rounded-lg overflow-hidden flex flex-col'>
                        <div className='p-4 border-b border-gray-800 flex justify-between items-center'>
                            <h3 className='text-xl font-bold'>Adjust {cropperTarget === 'banner' ? 'Banner' : 'Photo'} Position</h3>
                            <button onClick={() => setCropperTarget(null)} className='text-gray-400 hover:text-white'>✕</button>
                        </div>
                        <div className='flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden p-8'>
                            <p className='text-sm text-gray-400 mb-4'>Drag the sliders to adjust the position</p>
                            <div className={`relative ${cropperTarget === 'banner' ? 'w-full h-[200px]' : 'w-[200px] h-[200px] rounded-full'} border border-gray-700 overflow-hidden`}>
                                <img
                                    src={cropperTarget === 'banner' ? (bannerURL || defaultBanner) : (photoURL || user?.photoURL)}
                                    alt="Preview"
                                    className='absolute object-cover'
                                    style={{
                                        width: `${(cropperTarget === 'banner' ? bannerZoom : photoZoom) * 100}%`,
                                        height: `${(cropperTarget === 'banner' ? bannerZoom : photoZoom) * 100}%`,
                                        top: `${cropperTarget === 'banner' ? bannerPosition.y : photoPosition.y}%`,
                                        left: `${cropperTarget === 'banner' ? bannerPosition.x : photoPosition.x}%`,
                                        transform: `translate(-${cropperTarget === 'banner' ? bannerPosition.x : photoPosition.x}%, -${cropperTarget === 'banner' ? bannerPosition.y : photoPosition.y}%)`,
                                        objectPosition: cropperTarget === 'banner'
                                            ? `${bannerPosition.x}% ${bannerPosition.y}%`
                                            : `${photoPosition.x}% ${photoPosition.y}%`
                                    }}
                                />
                                <div className={`absolute inset-0 pointer-events-none border-x-4 border-y-4 border-[var(--primary)]/30 ${cropperTarget === 'photo' ? 'rounded-full' : ''}`}></div>
                            </div>

                            <div className='mt-8 w-full max-w-[400px] flex flex-col gap-6'>
                                <div>
                                    <div className='flex justify-between text-xs text-gray-500 mb-1'>
                                        <span>Horizontal</span>
                                        <span>{cropperTarget === 'banner' ? bannerPosition.x : photoPosition.x}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={cropperTarget === 'banner' ? bannerPosition.x : photoPosition.x}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (cropperTarget === 'banner') setBannerPosition(prev => ({ ...prev, x: val }));
                                            else setPhotoPosition(prev => ({ ...prev, x: val }));
                                        }}
                                        className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]'
                                    />
                                    <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                                        <span>Left</span>
                                        <span>Right</span>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-between text-xs text-gray-500 mb-1'>
                                        <span>Vertical</span>
                                        <span>{cropperTarget === 'banner' ? bannerPosition.y : photoPosition.y}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={cropperTarget === 'banner' ? bannerPosition.y : photoPosition.y}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (cropperTarget === 'banner') setBannerPosition(prev => ({ ...prev, y: val }));
                                            else setPhotoPosition(prev => ({ ...prev, y: val }));
                                        }}
                                        className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]'
                                    />
                                    <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                                        <span>Top</span>
                                        <span>Bottom</span>
                                    </div>
                                </div>

                                <div>
                                    <div className='flex justify-between text-xs text-gray-500 mb-1'>
                                        <span>Zoom</span>
                                        <span>{cropperTarget === 'banner' ? bannerZoom.toFixed(1) : photoZoom.toFixed(1)}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        step="0.1"
                                        value={cropperTarget === 'banner' ? bannerZoom : photoZoom}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            if (cropperTarget === 'banner') setBannerZoom(val);
                                            else setPhotoZoom(val);
                                        }}
                                        className='w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary)]'
                                    />
                                    <div className='flex justify-between text-[10px] text-gray-600 mt-1'>
                                        <span>Far</span>
                                        <span>Near</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='p-4 border-t border-gray-800 flex justify-end gap-4'>
                            <button
                                onClick={() => setCropperTarget(null)}
                                className='bg-[var(--primary)] text-black px-6 py-2 font-bold rounded hover:bg-opacity-80 transition'
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Account;
