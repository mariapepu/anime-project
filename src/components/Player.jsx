import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserAuth } from '../context/AuthContext';

const Player = ({ anime, onClose, videoUrl }) => {
    const videoRef = useRef(null);
    const { user } = UserAuth();
    const [savedTime, setSavedTime] = useState(null);

    // Handle both id (from static list) and animeId (from Firestore)
    const currentAnimeId = anime?.id || anime?.animeId;

    // Helper to transform Google Drive "view" links into direct streaming links
    const transformDriveUrl = (url) => {
        if (!url) return url;
        // Regex to find Google Drive file ID from various URL formats
        const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/;
        const match = url.match(driveRegex);
        if (match && match[1]) {
            // Using /u/0/ and export=media which sometimes helps with large files
            return `https://drive.google.com/u/0/uc?id=${match[1]}&export=media`;
        }
        return url;
    };

    // Use passed videoUrl (episode) or fallback to anime.video (movie)
    const source = transformDriveUrl(videoUrl || anime?.video);

    // Load progress when player opens
    useEffect(() => {
        const loadProgress = async () => {
            console.log("Player: Loading progress for", currentAnimeId);
            if (user?.email && currentAnimeId) {
                const docRef = doc(db, 'users', user.email, 'progress', currentAnimeId.toString());
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Player: Found progress", data);
                        if (data.timestamp) {
                            const newTime = Math.max(0, data.timestamp - 5);
                            console.log("Player: Setting savedTime to", newTime);
                            setSavedTime(newTime);
                        }
                    } else {
                        console.log("Player: No progress found");
                    }
                } catch (error) {
                    console.error("Player: Error loading progress", error);
                }
            }
        };
        loadProgress();
    }, [currentAnimeId, user]);

    // Handle video errors (common with Drive limits)
    const handleVideoError = (e) => {
        console.error("Player: Video error", e);
        if (source?.includes('drive.google.com')) {
            alert("Error de Google Drive: Es muy probable que el archivo sea mayor de 100MB y Google esté bloqueando la descarga directa por seguridad. Drive solo permite streaming directo en archivos pequeños.");
        }
    };

    // Effect to set time when savedTime loads (if video is already ready)
    useEffect(() => {
        if (savedTime !== null && videoRef.current && videoRef.current.readyState >= 1) {
            console.log("Player: Seeking to savedTime (useEffect)", savedTime);
            videoRef.current.currentTime = savedTime;
        }
    }, [savedTime]);

    // Handle when video metadata loads (if savedTime is already loaded)
    const handleLoadedMetadata = () => {
        console.log("Player: Metadata loaded");
        if (videoRef.current && savedTime !== null) {
            console.log("Player: Seeking to savedTime (onLoadedMetadata)", savedTime);
            videoRef.current.currentTime = savedTime;
        }
    };

    // Save progress function
    const saveProgress = async () => {
        if (user?.email && currentAnimeId && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            console.log("Player: Saving progress", currentTime);

            try {
                await setDoc(doc(db, 'users', user.email, 'progress', currentAnimeId.toString()), {
                    animeId: currentAnimeId,
                    title: anime.title,
                    image: anime.image,
                    video: videoUrl || anime.video,
                    timestamp: currentTime,
                    lastWatched: new Date(),
                    duration: duration
                });
                console.log("Player: Progress saved successfully");
            } catch (error) {
                console.error("Player: Error saving progress", error);
            }
        }
    };

    // Handle close button click
    const handleClose = async () => {
        console.log("Player: Close button clicked");
        await saveProgress();
        onClose();
    };

    // Save progress every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Player: Auto-saving...");
            saveProgress();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentAnimeId, user, anime]);

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
            <button
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    background: 'transparent',
                    color: 'white',
                    zIndex: 101,
                    cursor: 'pointer'
                }}
            >
                <X size={40} />
            </button>

            <video
                ref={videoRef}
                controls
                autoPlay
                crossOrigin="anonymous"
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleVideoError}
                style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: '100vh',
                }}
                src={source}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default Player;
