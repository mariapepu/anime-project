import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import Navbar from '../components/Navbar';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const { animeList } = useAnime();

    useEffect(() => {
        if (query && animeList.length > 0) {
            const filtered = animeList.filter(anime =>
                anime.title.toLowerCase().includes(query.toLowerCase()) ||
                anime.genres?.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="w-full min-h-screen bg-black text-white">
            <Navbar />
            <div className="pt-[100px] px-[4%] pb-20">
                <h2 className="text-2xl font-bold mb-8 text-[#e5e5e5]">
                    Results for "{query}"
                </h2>
                {results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-x-2 gap-y-10">
                        {results.map((anime) => {
                            // Helper to check if a date is within the last 7 days
                            const isRecent = (dateStr) => {
                                if (!dateStr) return false;
                                const date = new Date(dateStr);
                                const now = new Date();
                                const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                                return diffDays >= 0 && diffDays <= 7;
                            };

                            const shouldShowNewBadge = isRecent(anime.createdAt) && anime.category === 'Movie';
                            const shouldShowNewEpisodeBadge = isRecent(anime.lastEpisodeAt) && anime.category === 'Series';

                            return (
                                <Link
                                    to={`/title/${anime.id}`}
                                    key={anime.id}
                                    className="anime-card"
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                        width: '100%'
                                    }}
                                >
                                    {/* New Badges */}
                                    {shouldShowNewBadge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            backgroundColor: '#f2c2cb',
                                            color: '#141414',
                                            padding: '2px 9px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            borderRadius: '2px',
                                            zIndex: 30,
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                            letterSpacing: '0.2px',
                                            textTransform: 'uppercase',
                                            fontFamily: 'var(--font-main)'
                                        }}>
                                            New
                                        </div>
                                    )}
                                    {shouldShowNewEpisodeBadge && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px',
                                            backgroundColor: '#f2c2cb',
                                            color: '#141414',
                                            padding: '2px 9px',
                                            fontSize: '0.7rem',
                                            fontWeight: '800',
                                            borderRadius: '2px',
                                            zIndex: 30,
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                                            letterSpacing: '0.2px',
                                            textTransform: 'uppercase',
                                            fontFamily: 'var(--font-main)'
                                        }}>
                                            New epis.
                                        </div>
                                    )}

                                    <div
                                        className="anime-image"
                                        style={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderRadius: '4px',
                                            height: '140px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <img
                                            src={anime.image}
                                            alt={anime.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                position: 'relative',
                                                zIndex: 10
                                            }}
                                        />
                                    </div>
                                    <p style={{
                                        marginTop: '0.5rem',
                                        color: '#999',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        paddingLeft: '0.5rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {anime.title}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400">No matches found.</p>
                )}
            </div>
        </div>
    );
};

export default Search;
