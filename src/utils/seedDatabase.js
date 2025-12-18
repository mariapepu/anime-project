import { db } from '../firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { animeList } from '../data/anime';

export const seedDatabase = async () => {
    const batch = writeBatch(db);

    // Seed Anime List (includes featured marked items)
    animeList.forEach((anime) => {
        const docRef = doc(db, 'animes', anime.id.toString());
        batch.set(docRef, anime);
    });

    try {
        await batch.commit();
        console.log("Database seeded successfully!");
        alert("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database: ", error);
        alert("Error seeding database: " + error.message);
    }
};
