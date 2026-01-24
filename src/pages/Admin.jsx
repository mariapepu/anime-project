import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserAuth } from '../context/AuthContext';
import { useAnime } from '../context/AnimeContext';
import Navbar from '../components/Navbar';

const Admin = () => {
    const { user } = UserAuth();

    // Tu correo real de MizuPlay
    const ADMIN_EMAIL = "mperezpulles@gmail.com";

    // Anime Form State
    const [animeForm, setAnimeForm] = useState({
        id: '',
        title: '',
        category: 'Series',
        description: '',
        image: '',
        genres: '',
        isNew: false,
        featured: false,
        video: '', // Only for movies or featured
        genre: '' // Display genre
    });

    // Episode Form State
    const [episodeForm, setEpisodeForm] = useState({
        animeId: '',
        season: 1,
        episodeId: '',
        episodeTitle: '',
        videoUrl: '',
        duration: '24m'
    });

    const { baseVideoUrl, setBaseVideoUrl } = useAnime();
    const [newBaseUrl, setNewBaseUrl] = useState(baseVideoUrl);
    const [bulkJson, setBulkJson] = useState('');

    // Sync local state when base URL is fetched from context
    useEffect(() => {
        setNewBaseUrl(baseVideoUrl);
    }, [baseVideoUrl]);

    const [message, setMessage] = useState('');

    if (user?.email !== ADMIN_EMAIL) {
        return (
            <div className="bg-[#141414] min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Acceso Denegado</h1>
                    <p>No tienes permisos para ver esta página.</p>
                </div>
            </div>
        );
    }

    const handleAnimeSubmit = async (e) => {
        e.preventDefault();
        setMessage('Guardando anime...');
        try {
            const genresArray = animeForm.genres.split(',').map(g => g.trim());
            const animeData = {
                ...animeForm,
                id: parseInt(animeForm.id),
                genres: genresArray,
                createdAt: new Date().toISOString(), // Timestamp for "Nuevo" badge
                seasons: animeForm.category === 'Series' ? [{ season: 1, episodes: [] }] : null
            };

            await setDoc(doc(db, 'animes', animeForm.id.toString()), animeData);
            setMessage('¡Anime guardado con éxito!');
            setAnimeForm({ id: '', title: '', category: 'Series', description: '', image: '', genres: '', isNew: false, featured: false, video: '', genre: '' });
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleEpisodeSubmit = async (e) => {
        e.preventDefault();
        setMessage('Añadiendo episodio...');
        try {
            const animeRef = doc(db, 'animes', episodeForm.animeId.toString());
            const animeSnap = await getDoc(animeRef);

            if (!animeSnap.exists()) {
                throw new Error("No se encontró el anime con ese ID");
            }

            const animeData = animeSnap.data();
            const seasons = animeData.seasons || [];

            const seasonValue = isNaN(episodeForm.season) ? episodeForm.season : parseInt(episodeForm.season);

            // Find or create season
            let seasonIndex = seasons.findIndex(s => s.season === seasonValue);
            if (seasonIndex === -1) {
                seasons.push({ season: seasonValue, episodes: [] });
                seasonIndex = seasons.length - 1;
            }

            // Add episode
            const newEpisode = {
                id: parseInt(episodeForm.episodeId),
                title: episodeForm.episodeTitle,
                video: episodeForm.videoUrl,
                duration: episodeForm.duration
            };

            // Check if episode already exists to avoid duplicates
            const epExists = seasons[seasonIndex].episodes.some(ep => ep.id === newEpisode.id);
            if (epExists) {
                throw new Error("Ese número de episodio ya existe en esta temporada");
            }

            seasons[seasonIndex].episodes.push(newEpisode);

            // Sort episodes by ID
            seasons[seasonIndex].episodes.sort((a, b) => a.id - b.id);

            await updateDoc(animeRef, {
                seasons: seasons,
                lastEpisodeAt: new Date().toISOString() // Timestamp for "Nuevo Epis." badge
            });
            setMessage('¡Episodio añadido con éxito!');
            setEpisodeForm({ ...episodeForm, episodeId: '', episodeTitle: '', videoUrl: '' });
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleSettingsSubmit = async (e) => {
        e.preventDefault();
        setMessage('Actualizando configuración...');
        try {
            await setDoc(doc(db, 'settings', 'config'), {
                baseVideoUrl: newBaseUrl
            }, { merge: true });
            setBaseVideoUrl(newBaseUrl);
            setMessage('¡Configuración actualizada con éxito!');
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        setMessage('Procesando carga masiva...');
        try {
            const data = JSON.parse(bulkJson);
            const { animeId, season, episodes } = data;

            if (!animeId || !season || !episodes || !Array.isArray(episodes)) {
                throw new Error("Formato JSON inválido. Revisa el template.");
            }

            const animeRef = doc(db, 'animes', animeId.toString());
            const animeSnap = await getDoc(animeRef);

            if (!animeSnap.exists()) {
                throw new Error(`No se encontró el anime con ID ${animeId}`);
            }

            const animeData = animeSnap.data();
            const seasons = animeData.seasons || [];

            const seasonValue = isNaN(season) ? season : parseInt(season);

            let seasonIndex = seasons.findIndex(s => s.season === seasonValue);
            if (seasonIndex === -1) {
                seasons.push({ season: seasonValue, episodes: [] });
                seasonIndex = seasons.length - 1;
            }

            // Merge episodes (avoid duplicates by id)
            const currentEpisodes = seasons[seasonIndex].episodes;
            episodes.forEach(newEp => {
                const existingIndex = currentEpisodes.findIndex(e => e.id === newEp.id);
                if (existingIndex !== -1) {
                    currentEpisodes[existingIndex] = newEp; // Update if exists
                } else {
                    currentEpisodes.push(newEp); // Add if new
                }
            });

            // Sort
            seasons[seasonIndex].episodes.sort((a, b) => a.id - b.id);

            await updateDoc(animeRef, {
                seasons: seasons,
                lastEpisodeAt: new Date().toISOString()
            });

            setMessage(`¡${episodes.length} capítulos procesados con éxito!`);
            setBulkJson('');
        } catch (error) {
            setMessage('Error en bulk: ' + error.message);
        }
    };

    return (
        <div className="bg-[#141414] min-h-screen text-white">
            <Navbar />
            <div className="pt-24 px-[4%] max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-[var(--primary)]">Panel de Administrador</h1>

                {message && (
                    <div className="bg-blue-600/20 border border-blue-500 p-4 rounded mb-8 text-center animate-pulse">
                        {message}
                    </div>
                )}

                {/* Global Settings Section */}
                <section className="bg-[#222] p-6 rounded-lg border border-pink-500/30 mb-12 shadow-lg shadow-pink-500/5">
                    <h2 className="text-xl font-bold mb-4 text-pink-400">Configuración Global</h2>
                    <form onSubmit={handleSettingsSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">URL Base de Vídeo (Ej: https://tudominio.trycloudflare.com)</label>
                            <input
                                type="text"
                                value={newBaseUrl}
                                onChange={(e) => setNewBaseUrl(e.target.value)}
                                className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-pink-500 outline-none"
                                placeholder="Pega aquí la parte amarilla de la URL"
                            />
                        </div>
                        <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded font-bold hover:bg-pink-700 transition">
                            Actualizar URL Base
                        </button>
                    </form>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {/* Add Anime Form */}
                    <section className="bg-[#222] p-6 rounded-lg border border-gray-800">
                        <h2 className="text-xl font-bold mb-6">Añadir Nuevo Anime / Película</h2>
                        <form onSubmit={handleAnimeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">ID (Número único)</label>
                                <input required type="number" value={animeForm.id} onChange={(e) => setAnimeForm({ ...animeForm, id: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="Ej: 15" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Título</label>
                                <input required type="text" value={animeForm.title} onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                                <select value={animeForm.category} onChange={(e) => setAnimeForm({ ...animeForm, category: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none">
                                    <option value="Series">Series</option>
                                    <option value="Movie">Movie</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Imagen (URL)</label>
                                <input required type="text" value={animeForm.image} onChange={(e) => setAnimeForm({ ...animeForm, image: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Géneros (Separados por comas)</label>
                                <input required type="text" value={animeForm.genres} onChange={(e) => setAnimeForm({ ...animeForm, genres: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="Action, Fantasy, Comedy" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                                <textarea required value={animeForm.description} onChange={(e) => setAnimeForm({ ...animeForm, description: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none h-24" />
                            </div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={animeForm.isNew} onChange={(e) => setAnimeForm({ ...animeForm, isNew: e.target.checked })} className="accent-[var(--primary)]" />
                                    <span>Marcar como Nuevo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={animeForm.featured} onChange={(e) => setAnimeForm({ ...animeForm, featured: e.target.checked })} className="accent-[var(--primary)]" />
                                    <span>Destacado (Hero)</span>
                                </label>
                            </div>
                            <button type="submit" className="w-full bg-[var(--primary)] text-black font-bold py-2 rounded hover:bg-opacity-80 transition mt-4">Guardar Anime</button>
                        </form>
                    </section>

                    {/* Add Episode Form */}
                    <section className="bg-[#222] p-6 rounded-lg border border-gray-800">
                        <h2 className="text-xl font-bold mb-6">Añadir Episodio a Serie</h2>
                        <form onSubmit={handleEpisodeSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">ID del Anime (al que añadir)</label>
                                <input required type="number" value={episodeForm.animeId} onChange={(e) => setEpisodeForm({ ...episodeForm, animeId: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="ID numérico" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Temporada</label>
                                <input required type="number" value={episodeForm.season} onChange={(e) => setEpisodeForm({ ...episodeForm, season: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Número de Episodio</label>
                                <input required type="number" value={episodeForm.episodeId} onChange={(e) => setEpisodeForm({ ...episodeForm, episodeId: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Título del Episodio</label>
                                <input required type="text" value={episodeForm.episodeTitle} onChange={(e) => setEpisodeForm({ ...episodeForm, episodeTitle: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" placeholder="Ej: El reencuentro" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">URL de Vídeo (Cloudflare / Drive)</label>
                                <input required type="text" value={episodeForm.videoUrl} onChange={(e) => setEpisodeForm({ ...episodeForm, videoUrl: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Duración</label>
                                <input required type="text" value={episodeForm.duration} onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })} className="w-full bg-[#333] p-2 rounded border border-gray-700 focus:border-[var(--primary)] outline-none" />
                            </div>
                            <button type="submit" className="w-full bg-[var(--primary)] text-black font-bold py-2 rounded hover:bg-opacity-80 transition mt-4">Añadir Episodio</button>
                        </form>
                    </section>
                </div>

                {/* Bulk Upload Section */}
                <section className="bg-[#222] p-6 rounded-lg border border-yellow-500/30 mb-20 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-yellow-500">Carga Masiva de Capítulos (JSON)</h2>
                    <p className="text-sm text-gray-400 mb-4">Pega aquí el contenido de `bulk_template.json` relleno con tus datos.</p>
                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                        <textarea
                            value={bulkJson}
                            onChange={(e) => setBulkJson(e.target.value)}
                            className="w-full bg-[#333] p-4 rounded border border-gray-700 focus:border-yellow-500 outline-none h-64 font-mono text-xs"
                            placeholder='{"animeId": "1", "season": 1, "episodes": [...] }'
                        />
                        <button type="submit" className="bg-yellow-600 text-white px-8 py-3 rounded font-bold hover:bg-yellow-700 transition w-full md:w-auto">
                            Procesar Carga Masiva
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Admin;
