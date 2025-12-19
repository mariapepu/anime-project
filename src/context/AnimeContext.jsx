import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, collectionGroup, query } from 'firebase/firestore';

const AnimeContext = createContext();

export function AnimeContextProvider({ children }) {
    const [animeList, setAnimeList] = useState([]);
    const [trendingList, setTrendingList] = useState([]);
    const [newReleasesList, setNewReleasesList] = useState([]);
    const [featuredList, setFeaturedList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch all animes
                const animeSnapshot = await getDocs(collection(db, 'animes'));
                const list = [];
                animeSnapshot.forEach((doc) => {
                    const data = doc.data();
                    list.push({ ...data, id: parseInt(doc.id) || doc.id });
                });
                setAnimeList(list);

                // 2. Fetch viewing progress from ALL users (collectionGroup)
                // This requires a Firestore index for collectionGroup('progress')
                const progressSnapshot = await getDocs(query(collectionGroup(db, 'progress')));
                const popularityMap = {};

                progressSnapshot.forEach((doc) => {
                    const data = doc.data();
                    const animeId = data.animeId;
                    if (animeId) {
                        popularityMap[animeId] = (popularityMap[animeId] || 0) + 1;
                    }
                });

                // 3. Sort animes by popularity counts and filter for > 0
                const sortedByPopularity = [...list]
                    .filter(a => (popularityMap[a.id] || 0) > 0)
                    .sort((a, b) => {
                        const countA = popularityMap[a.id] || 0;
                        const countB = popularityMap[b.id] || 0;
                        return countB - countA; // Descending
                    });

                // Limit to top 10 trending
                setTrendingList(sortedByPopularity.slice(0, 10));

                // 4. Compute New Releases List (last 7 days, sorted by most recent)
                const newReleases = list
                    .filter(a => {
                        const isRecent = (dateStr) => {
                            if (!dateStr) return false;
                            const date = new Date(dateStr);
                            const now = new Date();
                            const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                            return diffDays >= 0 && diffDays <= 7;
                        };
                        return isRecent(a.createdAt) || isRecent(a.lastEpisodeAt);
                    })
                    .sort((a, b) => {
                        const dateA = new Date(a.lastEpisodeAt || a.createdAt);
                        const dateB = new Date(b.lastEpisodeAt || b.createdAt);
                        return dateB - dateA;
                    });

                // Export it
                setNewReleasesList(newReleases);

                // 5. Find featured from list or fallback to first
                const featuredItems = list.filter(item => item.featured === true);
                setFeaturedList(featuredItems.length > 0 ? featuredItems : [list[0]]);
            } catch (error) {
                console.error("Error fetching anime data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AnimeContext.Provider value={{ animeList, trendingList, newReleasesList, featuredList, loading }}>
            {children}
        </AnimeContext.Provider>
    );
}

export function useAnime() {
    return useContext(AnimeContext);
}
