import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import { Play, Plus, Check, ChevronDown } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';

const TitleDetails = () => {
    const { id } = useParams();
    const { user } = UserAuth();
    const { animeList, featuredAnime } = useAnime();
    const [anime, setAnime] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [playingEpisode, setPlayingEpisode] = useState(null);
    const [inList, setInList] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(1);

    useEffect(() => {
        if (!animeList || animeList.length === 0) return;

        // Find in regular list or check if it matches featured ID
        const found = animeList.find(item => item.id.toString() === id);
        if (found) {
            setAnime(found);
        } else if (featuredAnime && featuredAnime.id.toString() === id) {
            setAnime(featuredAnime);
        }
        window.scrollTo(0, 0);

        // Check if in My List
        const checkList = async () => {
            if (user?.email && id) {
                const docRef = doc(db, 'users', user.email, 'savedShows', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setInList(true);
                } else {
                    setInList(false);
                }
            }
        }
        checkList();

    }, [id, animeList, featuredAnime, user]);

    const toggleList = async () => {
        if (!user?.email || !anime) return;
        const animeId = anime.id.toString();
        const docRef = doc(db, 'users', user.email, 'savedShows', animeId);

        if (inList) {
            await deleteDoc(docRef);
            setInList(false);
        } else {
            await setDoc(docRef, {
                id: animeId,
                title: anime.title,
                image: anime.image,
                category: anime.category || 'Series'
            });
            setInList(true);
        }
    };

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
                            onClick={() => {
                                if (anime.category === 'Movie') {
                                    setPlayingEpisode(null); // Will use anime.video
                                } else if (anime.seasons) {
                                    const seasonData = anime.seasons.find(s => s.season === selectedSeason) || anime.seasons[0];
                                    if (seasonData.episodes[0]) {
                                        setPlayingEpisode(seasonData.episodes[0]);
                                    }
                                }
                                setPlaying(true);
                            }}
                            className="bg-[var(--primary)] text-black px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-opacity-80 transition"
                        >
                            <Play size={24} fill="black" /> Play
                        </button>
                        <button
                            onClick={toggleList}
                            className="bg-[#9c7880]/90 text-white px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#8a6a72] transition"
                        >
                            {inList ? <Check size={24} /> : <Plus size={24} />}
                            {inList ? 'In List' : 'My List'}
                        </button>
                    </div>

                    <p className="text-gray-300 text-sm md:text-lg drop-shadow-md">
                        {anime.description || "Join the adventure in this critically acclaimed series."}
                    </p>
                </div>
            </div>

            {/* Episodes & Info Section */}
            <div className="px-[4%] pt-6 pb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Episodes Column */}
                <div className="md:col-span-2">
                    {anime.category === 'Movie' ? (
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold mb-4">Watch Movie</h3>
                            <div
                                className="flex items-center gap-6 p-6 bg-[#222] hover:bg-[#333] rounded-lg cursor-pointer transition group border border-gray-800"
                                onClick={() => { setPlayingEpisode(null); setPlaying(true); }}
                            >
                                <div className="relative w-48 h-28 bg-gray-700 rounded overflow-hidden flex-shrink-0 shadow-lg">
                                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-transparent transition">
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm group-hover:scale-110 transition">
                                            <Play size={30} className="text-white" fill="white" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white mb-2">{anime.title}</h4>
                                    <p className="text-gray-400 text-sm mb-2">{anime.genre}</p>
                                    <span className="text-sm font-semibold bg-[var(--primary)] px-2 py-1 rounded text-black">Full Movie</span>
                                </div>
                            </div>
                        </div>
                    ) : (anime.seasons ? (
                        <>
                            {/* Season Selector */}
                            <div className="mb-8 relative inline-block group">
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-[#242424] text-white rounded px-4 py-2 pr-10 text-lg font-bold focus:outline-none cursor-pointer min-w-[160px] hover:bg-[#333] transition-colors"
                                        value={selectedSeason}
                                        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                                    >
                                        {anime.seasons.map(s => (
                                            <option key={s.season} value={s.season}>
                                                Season {s.season}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-white">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                                <h3 className="text-2xl font-bold">Episodes</h3>
                                <span className="text-lg text-gray-400">
                                    {anime.seasons.find(s => s.season === selectedSeason)?.episodes.length || 0} Episodes
                                </span>
                            </div>

                            <div className="space-y-4">
                                {(anime.seasons.find(s => s.season === selectedSeason)?.episodes || []).map((ep) => (
                                    <div key={ep.id} className="flex items-center gap-4 p-4 hover:bg-[#333] rounded cursor-pointer transition group" onClick={() => { setPlayingEpisode(ep); setPlaying(true); }}>
                                        <span className="text-2xl text-gray-500 font-bold w-6">{ep.id}</span>
                                        <div className="relative w-32 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                            <img src={anime.image} alt={`Ep ${ep.id}`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play size={20} className="invisible group-hover:visible" fill="white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm md:text-base">{ep.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.duration}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null)}

                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <div>
                        <span className="text-gray-500 block text-sm">Genre:</span>
                        <span className="text-white text-sm">{anime.genre || 'Anime'}</span>
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

            {
                playing && (
                    <Player
                        anime={anime}
                        onClose={() => { setPlaying(false); setPlayingEpisode(null); }}
                        videoUrl={playingEpisode?.video}
                    />
                )
            }
        </div >
    );
};

export default TitleDetails;
