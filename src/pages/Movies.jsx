import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Row from '../components/Row';
import Player from '../components/Player';
import { useAnime } from '../context/AnimeContext';

const Movies = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const { animeList, loading } = useAnime();

    if (loading) return <div className="text-white pt-20 pl-[4%]">Loading...</div>;

    const movies = animeList.filter(anime => anime.category === 'Movie');

    return (
        <>
            <Navbar />
            <div className='w-full text-white pt-[100px]'>
                <h1 className='text-3xl font-bold mb-4 px-[4%]'>Movies</h1>
                <Row title="All Movies" animes={movies} onPlay={setPlayingAnime} />
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default Movies;
