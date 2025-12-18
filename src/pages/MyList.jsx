import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Play } from 'lucide-react';
import Row from '../components/Row';

const MyList = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const [myList, setMyList] = useState([]);
    const { user } = UserAuth();

    useEffect(() => {
        const fetchList = async () => {
            if (user?.email) {
                const querySnapshot = await getDocs(collection(db, 'users', user.email, 'savedShows'));
                const listData = querySnapshot.docs.map(doc => doc.data());
                setMyList(listData);
            }
        };
        fetchList();
    }, [user, playingAnime]);

    return (
        <>
            <Navbar />
            <div className='w-full text-white pt-[100px]'>
                <h1 className='text-3xl font-bold mb-8 px-[4%]'>My List</h1>
                {myList.length > 0 ? (
                    <Row title="Saved Shows" animes={myList} onPlay={setPlayingAnime} />
                ) : (
                    <p className='text-gray-500 px-[4%]'>You haven't added anything to your list yet.</p>
                )}
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default MyList;
