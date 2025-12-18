import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Row from '../components/Row';
import Player from '../components/Player';
import { useAnime } from '../context/AnimeContext';

const Series = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const { animeList, loading } = useAnime();

    if (loading) return <div className="text-white pt-20 pl-[4%]">Loading...</div>;

    const seriesList = animeList.filter(anime => anime.category === 'Series');

    // Dynamic Genre Calculation (Threshold: 3)
    const genreCounts = {};
    seriesList.forEach(anime => {
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
            <div className='w-full text-white pt-[100px]'>
                <h1 className='text-3xl font-bold mb-4 px-[4%]'>TV Series</h1>

                {significantGenres.map(genre => (
                    <Row
                        key={genre}
                        title={genre.charAt(0).toUpperCase() + genre.slice(1)}
                        animes={seriesList.filter(a => a.genres?.some(g => g.toLowerCase().trim() === genre))}
                        onPlay={setPlayingAnime}
                    />
                ))}

                <Row title="All Series" animes={seriesList} onPlay={setPlayingAnime} />
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default Series;
