import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeList, featuredAnime } from '../data/anime';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import { Play, Plus, Check } from 'lucide-react';

const TitleDetails = () => {
    const { id } = useParams();
    const [anime, setAnime] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [inList, setInList] = useState(false);

    useEffect(() => {
        // Find in regular list or check if it matches featured ID (though featured is usually in list too)
        const found = animeList.find(item => item.id === parseInt(id));
        setAnime(found || featuredAnime); // Fallback to featured if not found for demo stability
        window.scrollTo(0, 0);
    }, [id]);

    if (!anime) return <div className="text-white pt-20">Loading...</div>;

    return (
        <div className="bg-[#141414] min-h-screen text-white">
            <Navbar />

            {/* Hero / Banner Section */}
            <div className="relative w-full h-[70vh]">
                <div className="absolute w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-10" />
                <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-[#141414]/50 to-[#141414] z-10 bottom-0" />
                <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-[30%] lg:top-[40%] pl-[4%] z-20 max-w-[90%] md:max-w-[50%]">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                        {anime.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-300 mb-6 text-sm md:text-base">
                        <span className="text-green-400 font-bold">98% Match</span>
                        <span>2024</span>
                        <span className="border border-gray-500 px-2 py-0.5 text-xs">16+</span>
                        <span>{anime.category === 'Movie' ? '1h 55m' : '1 Season'}</span>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setPlaying(true)}
                            className="bg-white text-black px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-opacity-80 transition"
                        >
                            <Play size={24} fill="black" /> Play
                        </button>
                        <button
                            onClick={() => setInList(!inList)}
                            className="bg-gray-600/70 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-gray-600 transition"
                        >
                            {inList ? <Check size={24} /> : <Plus size={24} />}
                            {inList ? 'In List' : 'My List'}
                        </button>
                    </div>

                    <p className="text-gray-300 text-sm md:text-lg drop-shadow-md">
                        {anime.description || "Join the adventure in this critically acclaimed series. Action, emotion, and unforgettable characters await in a world where anything is possible."}
                    </p>
                </div>
            </div>

            {/* Episodes & Info Section */}
            <div className="px-[4%] py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Episodes Column */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-2">
                        <h3 className="text-2xl font-bold">Episodes</h3>
                        <span className="text-lg text-gray-400">Season 1</span>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((ep) => (
                            <div key={ep} className="flex items-center gap-4 p-4 hover:bg-[#333] rounded cursor-pointer transition group" onClick={() => setPlaying(true)}>
                                <span className="text-2xl text-gray-500 font-bold w-6">{ep}</span>
                                <div className="relative w-32 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    <img src={anime.image} alt={`Ep ${ep}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Play size={20} className="invisible group-hover:visible" fill="white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm md:text-base">Episode Title {ep}</h4>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">Something amazing happens in this specific episode involving the main character.</p>
                                </div>
                                <span className="ml-auto text-sm text-gray-500">24m</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <div>
                        <span className="text-gray-500 block text-sm">Genre:</span>
                        <span className="text-white text-sm">Action, Shonen, Fantasy</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-sm">Cast:</span>
                        <span className="text-white text-sm">Voice Actor 1, Voice Actor 2</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-sm">Maturity Rating:</span>
                        <span className="border border-white/40 px-2 py-0.5 text-xs inline-block mt-1">TV-MA</span>
                        <p className="text-xs text-gray-400 mt-1">Violence, Language</p>
                    </div>
                </div>
            </div>

            {playing && <Player anime={anime} onClose={() => setPlaying(false)} />}
        </div>
    );
};

export default TitleDetails;
