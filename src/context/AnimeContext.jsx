import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, collectionGroup, query } from 'firebase/firestore';

const AnimeContext = createContext();

export function AnimeContextProvider({ children }) {
    const [animeList, setAnimeList] = useState([]);
    const [trendingList, setTrendingList] = useState([]);
    const [featuredAnime, setFeaturedAnime] = useState(null);
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

                // 3. Sort animes by popularity counts
                const sortedByPopularity = [...list].sort((a, b) => {
                    const countA = popularityMap[a.id] || 0;
                    const countB = popularityMap[b.id] || 0;
                    return countB - countA; // Descending
                });

                // Limit top trending or keep all sorted
                setTrendingList(sortedByPopularity);

                // 4. Find featured from list or fallback to first
                const featuredItem = list.find(item => item.featured === true);
                setFeaturedAnime(featuredItem || list[0]);
            } catch (error) {
                console.error("Error fetching anime data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <AnimeContext.Provider value={{ animeList, trendingList, featuredAnime, loading }}>
            {children}
        </AnimeContext.Provider>
    );
}

export function useAnime() {
    return useContext(AnimeContext);
}
