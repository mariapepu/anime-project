import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Row from '../components/Row';
import Player from '../components/Player';
import { useAnime } from '../context/AnimeContext';

const NewPopular = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const { animeList, trendingList, newReleasesList, loading } = useAnime();

    if (loading) return <div className="text-white pt-20 pl-[4%]">Loading...</div>;

    return (
        <>
            <Navbar />
            <div className='w-full text-white pt-[100px]'>
                <h1 className='text-3xl font-bold mb-4 px-[4%]'>New & Popular</h1>
                <Row title="New Releases" animes={newReleasesList} onPlay={setPlayingAnime} />
                <Row title="Trending Now" animes={trendingList} onPlay={setPlayingAnime} />
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default NewPopular;
