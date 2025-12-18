import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Row from '../components/Row';
import Player from '../components/Player';
import { animeList } from '../data/anime';

const Series = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const series = animeList.filter(anime => anime.category === 'Series');

    return (
        <>
            <Navbar />
            <div className='w-full text-white pt-[100px]'>
                <h1 className='text-3xl font-bold mb-4 px-[4%]'>TV Series</h1>
                <Row title="All Series" animes={series} onPlay={setPlayingAnime} />
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default Series;
