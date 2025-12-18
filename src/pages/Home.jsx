import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Row from '../components/Row';
import Player from '../components/Player';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAnime } from '../context/AnimeContext';

const Home = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const [continueWatching, setContinueWatching] = useState([]);
    const { user } = UserAuth();
    const { animeList, trendingList, featuredAnime, loading } = useAnime();

    useEffect(() => {
        const fetchProgress = async () => {
            if (user?.email) {
                const querySnapshot = await getDocs(collection(db, 'users', user.email, 'progress'));
                const progressData = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.data().animeId
                }));
                setContinueWatching(progressData);
            }
        };
        fetchProgress();
    }, [user, playingAnime]);

    const handlePlay = (anime) => {
        setPlayingAnime(anime);
    };

    const handleClosePlayer = () => {
        setPlayingAnime(null);
    };

    if (loading) return <div className="text-white pt-20 pl-10">Loading...</div>;

    // Dynamic Genre Calculation
    const genreCounts = {};
    animeList.forEach(anime => {
        anime.genres?.forEach(genre => {
            const normalizedGenre = genre.toLowerCase().trim();
            genreCounts[normalizedGenre] = (genreCounts[normalizedGenre] || 0) + 1;
        });
    });

    const significantGenres = Object.keys(genreCounts)
        .filter(genre => genreCounts[genre] >= 3)
        .sort((a, b) => genreCounts[b] - genreCounts[a]);

    return (
        <>
            <Navbar />
            <Hero anime={featuredAnime} onPlay={handlePlay} />
            <div style={{ marginTop: '-120px', position: 'relative', zIndex: 10 }}>
                {continueWatching.length > 0 && (
                    <Row title="Continue Watching" animes={continueWatching} onPlay={handlePlay} isPlayableCard={true} />
                )}
                <Row title="Trending Now" animes={trendingList} onPlay={handlePlay} />
                {animeList.filter(a => a.isNew).length > 0 && (
                    <Row title="New Releases" animes={animeList.filter(a => a.isNew)} onPlay={handlePlay} />
                )}

                {significantGenres.map(genre => (
                    <Row
                        key={genre}
                        title={genre.charAt(0).toUpperCase() + genre.slice(1)}
                        animes={animeList.filter(a => a.genres?.some(g => g.toLowerCase().trim() === genre))}
                        onPlay={handlePlay}
                    />
                ))}
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={handleClosePlayer} />
            )}
        </>
    );
};

export default Home;
