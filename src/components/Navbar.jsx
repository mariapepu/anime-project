import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logOut } = UserAuth();
    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);

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
                        ANIMEFLIX
                    </h1>
                </Link>
                {user?.email ? (
                    <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', color: '#e5e5e5', fontSize: '0.9rem' }}>
                        <Link to='/'><li style={{ cursor: 'pointer', fontWeight: 'bold' }}>Home</li></Link>
                        <Link to='/series'><li style={{ cursor: 'pointer' }}>Series</li></Link>
                        <Link to='/movies'><li style={{ cursor: 'pointer' }}>Movies</li></Link>
                        <Link to='/new'><li style={{ cursor: 'pointer' }}>New & Popular</li></Link>
                        <Link to='/mylist'><li style={{ cursor: 'pointer' }}>My List</li></Link>
                    </ul>
                ) : null}
            </div>

            {user?.email ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'white' }}>
                    <Search size={20} style={{ cursor: 'pointer' }} />
                    <Bell size={20} style={{ cursor: 'pointer' }} />

                    <div
                        style={{ position: 'relative' }}
                        onMouseEnter={() => setShowMenu(true)}
                        onMouseLeave={() => setShowMenu(false)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        <button className='bg-red-600 px-6 py-2 rounded cursor-pointer text-white'>
                            Sign Up
                        </button>
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
