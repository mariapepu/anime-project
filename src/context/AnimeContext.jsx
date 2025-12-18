import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const AnimeContext = createContext();

export function AnimeContextProvider({ children }) {
    const [animeList, setAnimeList] = useState([]);
    const [featuredAnime, setFeaturedAnime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all animes
                const querySnapshot = await getDocs(collection(db, 'animes'));
                const list = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    list.push({ ...data, id: parseInt(doc.id) || doc.id });
                });

                setAnimeList(list);
                // Find featured from list or fallback to first
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
        <AnimeContext.Provider value={{ animeList, featuredAnime, loading }}>
            {children}
        </AnimeContext.Provider>
    );
}

export function useAnime() {
    return useContext(AnimeContext);
}
