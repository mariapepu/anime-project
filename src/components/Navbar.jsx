import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import { useAnime } from '../context/AnimeContext';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logOut } = UserAuth();
    const { animeList } = useAnime();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);
    const [userData, setUserData] = useState(null);
    const searchRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click outside to close search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let unsubscribe;
        if (user?.email) {
            unsubscribe = onSnapshot(doc(db, 'users', user.email), (doc) => {
                if (doc.exists()) {
                    setUserData(doc.data());
                }
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = (e) => {
        const text = e.target.value;
        setQuery(text);

        if (text.length > 0) {
            const filtered = animeList.filter(anime =>
                anime.title.toLowerCase().includes(text.toLowerCase())
            );
            setSearchResults(filtered);
        } else {
            setSearchResults([]);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSearch(false);
        setQuery('');
        setSearchResults([]);
        navigate(`/search?q=${query}`);
    };

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 50,
                padding: '1rem 4%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.3s',
                backgroundColor: isScrolled ? 'var(--background)' : 'transparent',
                backgroundImage: isScrolled ? 'none' : 'linear-gradient(to bottom, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0))',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link to='/'>
                    <h1 style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        MIZUPLAY
                    </h1>
                </Link>
                {user?.email && (
                    <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', color: '#e5e5e5', fontSize: '0.9rem' }} className="hidden md:flex">
                        <Link to='/'><li style={{ cursor: 'pointer', fontWeight: 'bold' }}>Home</li></Link>
                        <Link to='/series'><li style={{ cursor: 'pointer' }}>Series</li></Link>
                        <Link to='/movies'><li style={{ cursor: 'pointer' }}>Movies</li></Link>
                        <Link to='/new'><li style={{ cursor: 'pointer' }}>New & Popular</li></Link>
                        <Link to='/mylist'><li style={{ cursor: 'pointer' }}>My List</li></Link>
                    </ul>
                )}
            </div>

            {user?.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white' }}>

                    {/* Search Component */}
                    <div className="relative flex items-center h-[32px]" ref={searchRef}>
                        <div
                            className={`flex items-center bg-[var(--background)] transition-all duration-300 rounded-[4px] overflow-hidden ${showSearch ? 'w-[200px] md:w-[250px] h-full px-2' : 'w-0 h-full'}`}
                        >
                            <form onSubmit={handleSearchSubmit} className="w-full">
                                <input
                                    type="text"
                                    className="bg-transparent border-none text-white focus:outline-none pl-2 text-sm w-full placeholder:text-gray-500"
                                    placeholder="Titles, people, genres"
                                    value={query}
                                    onChange={handleSearch}
                                />
                            </form>
                            {query && (
                                <span className="cursor-pointer text-xs px-2 text-gray-400 hover:text-white" onClick={() => { setQuery(''); setSearchResults([]); }}>X</span>
                            )}
                            <Search
                                size={18}
                                className="min-w-[18px] cursor-pointer text-gray-400"
                                onClick={() => setShowSearch(false)}
                            />
                        </div>
                        {!showSearch && (
                            <Search
                                size={20}
                                className="cursor-pointer hover:text-gray-400 transition-colors"
                                onClick={() => setShowSearch(true)}
                            />
                        )}

                        {/* Autocomplete Dropdown */}
                        {searchResults.length > 0 && showSearch && (
                            <div className="absolute top-10 right-0 w-[300px] bg-[var(--background)] shadow-2xl max-h-[350px] overflow-y-auto rounded z-50">
                                {searchResults.map(result => (
                                    <div
                                        key={result.id}
                                        className="flex items-center gap-3 p-3 cursor-pointer border-b border-white/5"
                                        onClick={() => {
                                            navigate(`/title/${result.id}`);
                                            setShowSearch(false);
                                            setQuery('');
                                            setSearchResults([]);
                                        }}
                                    >
                                        <img src={result.image} alt={result.title} className="w-10 h-14 min-w-[40px] object-cover rounded" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold leading-tight mb-1">{result.title}</p>
                                            <p className="text-xs text-gray-400">{result.category}</p>
                                        </div>
                                    </div>
                                ))}
                                <div
                                    className="p-2 text-center text-xs text-[#141414] bg-[var(--primary)] cursor-pointer hover:opacity-90 font-bold"
                                    onClick={(e) => handleSearchSubmit(e)}
                                >
                                    View all results for "{query}"
                                </div>
                            </div>
                        )}
                    </div>

                    <Bell size={20} style={{ cursor: 'pointer' }} />

                    <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowMenu(true)}
                        onMouseLeave={() => setShowMenu(false)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        style={{
                                            position: 'absolute',
                                            width: `${(userData?.photoZoom || 1) * 100}%`,
                                            height: `${(userData?.photoZoom || 1) * 100}%`,
                                            top: `${userData?.photoPosition?.y ?? 50}%`,
                                            left: `${userData?.photoPosition?.x ?? 50}%`,
                                            transform: `translate(-${userData?.photoPosition?.x ?? 50}%, -${userData?.photoPosition?.y ?? 50}%)`,
                                            objectFit: 'cover',
                                            objectPosition: `${userData?.photoPosition?.x ?? 50}% ${userData?.photoPosition?.y ?? 50}%`
                                        }}
                                    />
                                ) : (
                                    <User size={20} color="#141414" />
                                )}
                            </div>
                        </div>

                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '32px',
                                right: 0,
                                backgroundColor: 'rgba(0,0,0,0.9)',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                padding: '10px',
                                minWidth: '150px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <Link to='/account' style={{ fontSize: '0.9rem', color: '#fff', textDecoration: 'none' }}>
                                    See Profile
                                </Link>
                                {user?.email === 'mperezpulles@gmail.com' && (
                                    <Link to='/admin' style={{ fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                                        Admin Panel
                                    </Link>
                                )}
                                <div style={{ height: '1px', backgroundColor: '#333' }}></div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        padding: 0
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link to='/login'>
                        <button className='text-white pr-4'>Sign In</button>
                    </Link>
                    <Link to='/signup'>
                        <button className='bg-[var(--primary)] px-6 py-2 rounded cursor-pointer text-black'>
                            Sign Up
                        </button>
                    </Link>
                </div>
            )}
            {/* Temporary Seed Button */}
            <button
                disabled
                onClick={async () => {
                    const { seedDatabase } = await import('../utils/seedDatabase');
                    seedDatabase();
                }}
                className="fixed bottom-4 right-4 bg-yellow-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-black px-4 py-2 rounded z-[100] font-bold"
            >
                SEED DB
            </button>
        </nav>
    );
};

export default Navbar;
