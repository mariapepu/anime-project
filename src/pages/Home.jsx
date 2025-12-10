import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import Player from '../components/Player';
import { featuredAnime, animeList } from '../data/anime';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const Home = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const [continueWatching, setContinueWatching] = useState([]);
    const { user } = UserAuth();

    useEffect(() => {
        const fetchProgress = async () => {
            if (user?.email) {
                const querySnapshot = await getDocs(collection(db, 'users', user.email, 'progress'));
                const progressData = querySnapshot.docs.map(doc => doc.data());
                setContinueWatching(progressData);
            }
        };
        fetchProgress();
    }, [user, playingAnime]); // Re-fetch when player closes

    const handlePlay = (anime) => {
        setPlayingAnime(anime);
    };

    const handleClosePlayer = () => {
        setPlayingAnime(null);
    };

    return (
        <>
            <Navbar />
            <Hero anime={featuredAnime} onPlay={handlePlay} />
            <div style={{ marginTop: '-150px', position: 'relative', zIndex: 10 }}>
                {continueWatching.length > 0 && (
                    <Row title="Continue Watching" animes={continueWatching} onPlay={handlePlay} />
                )}
                <Row title="Trending Now" animes={animeList} onPlay={handlePlay} />
                <Row title="New Releases" animes={[...animeList].reverse()} onPlay={handlePlay} />
                <Row title="Action Anime" animes={animeList} onPlay={handlePlay} />
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={handleClosePlayer} />
            )}
        </>
    );
};

export default Home;
