import React, { useEffect, useRef, useState } from 'react';
import { X, SkipForward, SkipBack, Home, ChevronLeft } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAuth } from '../context/AuthContext';

const Player = ({ anime, onClose, videoUrl: initialVideoUrl }) => {
    const videoRef = useRef(null);
    const { user } = UserAuth();
    const [savedTime, setSavedTime] = useState(null);
    const [currentVideoSource, setCurrentVideoSource] = useState(initialVideoUrl || anime?.video);
    const [currentEpInfo, setCurrentEpInfo] = useState(null);
    const [showEndOverlay, setShowEndOverlay] = useState(false);

    // Handle both id (from static list) and animeId (from Firestore)
    const currentAnimeId = anime?.id || anime?.animeId;

    // Helper to transform Google Drive "view" links into direct streaming links
    const transformDriveUrl = (url) => {
        if (!url) return url;
        const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            return `https://drive.google.com/u/0/uc?id=${match[1]}&export=media`;
        }
        return url;
    };

    // Find current episode info in anime data
    useEffect(() => {
        if (anime.category === 'Series' && anime.seasons) {
            for (let s of anime.seasons) {
                const ep = s.episodes.find(e => e.video === currentVideoSource);
                if (ep) {
                    setCurrentEpInfo({ ...ep, season: s.season });
                    return;
                }
            }
        }
        setCurrentEpInfo(null);
    }, [currentVideoSource, anime]);

    // Load progress for current anime
    const loadProgress = async () => {
        if (user?.email && currentAnimeId) {
            const docRef = doc(db, 'users', user.email, 'progress', currentAnimeId.toString());
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // If the saved video matches current source, seek to timestamp
                    if (data.video === currentVideoSource && data.timestamp) {
                        const newTime = Math.max(0, data.timestamp - 5);
                        setSavedTime(newTime);
                    } else {
                        setSavedTime(0);
                    }
                } else {
                    setSavedTime(0);
                }
            } catch (error) {
                console.error("Player: Error loading progress", error);
            }
        }
    };

    useEffect(() => {
        loadProgress();
    }, [currentAnimeId, user, currentVideoSource]);

    // Save progress function
    const saveProgress = async () => {
        if (user?.email && currentAnimeId && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (isNaN(duration)) return;

            try {
                await setDoc(doc(db, 'users', user.email, 'progress', currentAnimeId.toString()), {
                    animeId: currentAnimeId,
                    title: currentEpInfo ? currentEpInfo.title : anime.title,
                    image: anime.image,
                    video: currentVideoSource,
                    timestamp: currentTime,
                    lastWatched: new Date(),
                    duration: duration,
                    category: anime.category,
                    season: currentEpInfo ? currentEpInfo.season : 1,
                    episodeNo: currentEpInfo ? currentEpInfo.id : 1,
                    animeTitle: anime.title
                });
            } catch (error) {
                console.error("Player: Error saving progress", error);
            }
        }
    };

    // Auto-save every 10 seconds
    useEffect(() => {
        const interval = setInterval(saveProgress, 10000);
        return () => clearInterval(interval);
    }, [currentAnimeId, user, currentVideoSource, currentEpInfo]);

    // Handle next/prev logic
    const navigateEpisode = (direction) => {
        if (anime.category !== 'Series' || !anime.seasons) return;

        let found = false;
        for (let sIndex = 0; sIndex < anime.seasons.length; sIndex++) {
            const s = anime.seasons[sIndex];
            const epIndex = s.episodes.findIndex(ep => ep.video === currentVideoSource);

            if (epIndex !== -1) {
                found = true;
                if (direction === 'next') {
                    if (epIndex < s.episodes.length - 1) {
                        // Next ep same season
                        saveProgress();
                        setCurrentVideoSource(s.episodes[epIndex + 1].video);
                    } else if (sIndex < anime.seasons.length - 1) {
                        // First ep next season
                        saveProgress();
                        setCurrentVideoSource(anime.seasons[sIndex + 1].episodes[0].video);
                    } else {
                        // End of series
                        saveProgress();
                        setShowEndOverlay(true);
                    }
                } else { // prev
                    if (epIndex > 0) {
                        saveProgress();
                        setCurrentVideoSource(s.episodes[epIndex - 1].video);
                    } else if (sIndex > 0) {
                        // Last ep prev season
                        saveProgress();
                        const prevS = anime.seasons[sIndex - 1];
                        setCurrentVideoSource(prevS.episodes[prevS.episodes.length - 1].video);
                    }
                }
                break;
            }
        }
    };

    const handleVideoEnd = () => {
        if (anime.category === 'Series') {
            navigateEpisode('next');
        } else {
            setShowEndOverlay(true);
        }
    };

    const handleClose = async () => {
        await saveProgress();
        onClose();
    };

    // Seek logic
    useEffect(() => {
        if (savedTime !== null && videoRef.current) {
            videoRef.current.currentTime = savedTime;
        }
    }, [savedTime]);

    if (!anime) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            {/* Header Controls */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
                zIndex: 110
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={handleClose} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>
                        <ChevronLeft size={40} />
                    </button>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>{anime.title}</h2>
                        {currentEpInfo && (
                            <p style={{ color: '#ccc', margin: 0, fontSize: '0.9rem' }}>
                                Season {currentEpInfo.season}, Episode {currentEpInfo.id}: {currentEpInfo.title}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    <X size={40} />
                </button>
            </div>

            {/* Video Player */}
            <video
                ref={videoRef}
                controls
                autoPlay
                crossOrigin="anonymous"
                onLoadedMetadata={() => { if (savedTime !== null) videoRef.current.currentTime = savedTime; }}
                onEnded={handleVideoEnd}
                style={{ width: '100%', height: '100%', maxHeight: '100vh' }}
                src={transformDriveUrl(currentVideoSource)}
            />

            {/* Overlay Navigation Controls (on hover) */}
            <div className="player-nav-container" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 105,
                pointerEvents: 'none'
            }}>
                {anime.category === 'Series' && (
                    <>
                        <button
                            onClick={() => navigateEpisode('prev')}
                            style={{
                                position: 'absolute',
                                left: '4rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'auto',
                                background: 'rgba(0,0,0,0.4)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: 0
                            }}
                            className="nav-btn"
                        >
                            <SkipBack size={40} />
                        </button>
                        <button
                            onClick={() => navigateEpisode('next')}
                            style={{
                                position: 'absolute',
                                right: '4rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'auto',
                                background: 'rgba(0,0,0,0.4)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: 0
                            }}
                            className="nav-btn"
                        >
                            <SkipForward size={40} />
                        </button>
                    </>
                )}
            </div>

            {/* End Screen Overlay */}
            {showEndOverlay && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 120,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    padding: '2rem'
                }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {anime.category === 'Series' ? '¡Has terminado la serie!' : '¡Fin de la película!'}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#999', marginBottom: '3rem' }}>
                        {anime.category === 'Series'
                            ? 'No hay más capítulos disponibles por ahora.'
                            : 'Esperamos que hayas disfrutado de la película.'}
                    </p>
                    <button
                        onClick={handleClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            backgroundColor: 'white',
                            color: 'black',
                            padding: '1rem 2.5rem',
                            borderRadius: '4px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Home size={24} />
                        Volver al inicio
                    </button>
                </div>
            )}

            <style>{`
                .player-nav-container:hover .nav-btn {
                    opacity: 1 !important;
                }
                .nav-btn:hover {
                    background: rgba(255,255,255,0.2) !important;
                    transform: scale(1.1) translateY(-50%) !important;
                }
            `}</style>
        </div>
    );
};

export default Player;
