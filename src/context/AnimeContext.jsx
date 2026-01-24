import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, collectionGroup, query } from 'firebase/firestore';

const AnimeContext = createContext();

const AnimeContextProvider = ({ children }) => {
    const [animeList, setAnimeList] = useState([]);
    const [trendingList, setTrendingList] = useState([]);
    const [newReleasesList, setNewReleasesList] = useState([]);
    const [featuredList, setFeaturedList] = useState([]);
    const [baseVideoUrl, setBaseVideoUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch all animes
                let list = [];
                try {
                    const animeSnapshot = await getDocs(collection(db, 'animes'));
                    animeSnapshot.forEach((doc) => {
                        const data = doc.data();
                        list.push({ ...data, id: parseInt(doc.id) || doc.id });
                    });
                    setAnimeList(list);
                } catch (animeError) {
                    console.error("Error fetching animes:", animeError);
                    setAnimeList([]);
                }

                // 2. Fetch viewing progress for Trending (collectionGroup)
                try {
                    const progressSnapshot = await getDocs(query(collectionGroup(db, 'progress')));
                    const popularityMap = {};

                    progressSnapshot.forEach((doc) => {
                        const data = doc.data();
                        const animeId = data.animeId;
                        if (animeId) {
                            popularityMap[animeId] = (popularityMap[animeId] || 0) + 1;
                        }
                    });

                    const sortedByPopularity = [...list]
                        .filter(a => (popularityMap[a.id] || 0) > 0)
                        .sort((a, b) => (popularityMap[b.id] || 0) - (popularityMap[a.id] || 0));

                    setTrendingList(sortedByPopularity.slice(0, 10));
                } catch (trendingError) {
                    console.warn("Trending logic failed (probably missing index/permissions):", trendingError);
                    // Fallback: Use new releases as trending or just empty for now
                    setTrendingList(list.slice(0, 5));
                }

                // 3. Compute New Releases List
                const newReleases = list
                    .filter(a => {
                        const isRecent = (dateStr) => {
                            if (!dateStr) return false;
                            const date = new Date(dateStr);
                            const now = new Date();
                            const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                            return diffDays >= 0 && diffDays <= 14; // Extended to 14 days
                        };
                        return isRecent(a.createdAt) || isRecent(a.lastEpisodeAt);
                    })
                    .sort((a, b) => new Date(b.lastEpisodeAt || b.createdAt) - new Date(a.lastEpisodeAt || a.createdAt));

                setNewReleasesList(newReleases);

                // 4. Find featured
                const featuredItems = list.filter(item => item.featured === true);
                setFeaturedList(featuredItems.length > 0 ? featuredItems : list.slice(0, 1));

                // 5. Fetch Global Settings
                try {
                    const configDoc = await getDoc(doc(db, 'settings', 'config'));
                    if (configDoc.exists()) {
                        setBaseVideoUrl(configDoc.data()?.baseVideoUrl || '');
                    }
                } catch (settingsError) {
                    console.warn("Could not fetch global settings:", settingsError);
                }

            } catch (error) {
                console.warn("General error in AnimeContext fetchData:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AnimeContext.Provider value={{ animeList, trendingList, newReleasesList, featuredList, baseVideoUrl, setBaseVideoUrl, loading }}>
            {!loading && children}
        </AnimeContext.Provider>
    );
};

const useAnime = () => useContext(AnimeContext);

export { AnimeContextProvider, useAnime };
