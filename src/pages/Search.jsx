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
                anime.title.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query]);

    return (
        <div className="w-full min-h-screen bg-black text-white">
            <Navbar />
            <div className="pt-[100px] px-[4%]">
                <h2 className="text-2xl font-bold mb-6">
                    Results for "{query}"
                </h2>
                {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.map((anime) => (
                            <Link to={`/title/${anime.id}`} key={anime.id}>
                                <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-10">
                                    <img
                                        src={anime.image}
                                        alt={anime.title}
                                        className="w-full h-auto rounded block"
                                    />
                                    <div className="absolute top-0 left-0 w-full h-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-bold text-center px-2">{anime.title}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No matches found.</p>
                )}
            </div>
        </div>
    );
};

export default Search;
