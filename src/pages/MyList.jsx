import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import { UserAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Play } from 'lucide-react';

const MyList = () => {
    const [playingAnime, setPlayingAnime] = useState(null);
    const [myList, setMyList] = useState([]);
    const { user } = UserAuth();

    useEffect(() => {
        const fetchList = async () => {
            if (user?.email) {
                const querySnapshot = await getDocs(collection(db, 'users', user.email, 'progress'));
                const listData = querySnapshot.docs.map(doc => doc.data());
                setMyList(listData);
            }
        };
        fetchList();
    }, [user, playingAnime]);

    return (
        <>
            <Navbar />
            <div className='w-full text-white pt-[100px] px-4'>
                <h1 className='text-3xl font-bold mb-8'>My List</h1>
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {myList.map((item, id) => (
                        <div key={id} className='relative cursor-pointer group' onClick={() => setPlayingAnime(item)}>
                            <img
                                className='w-full h-auto block rounded'
                                src={item.image}
                                alt={item.title}
                            />
                            <div className='absolute top-0 left-0 w-full h-full hover:bg-black/80 opacity-0 hover:opacity-100 text-white flex items-center justify-center transition-all duration-300'>
                                <div className='flex flex-col items-center'>
                                    <Play size={40} className='mb-2' />
                                    <p className='white-space-normal text-xs md:text-sm font-bold flex justify-center items-center text-center'>
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {myList.length === 0 && (
                    <p className='text-gray-500'>You haven't watched anything yet.</p>
                )}
            </div>
            {playingAnime && (
                <Player anime={playingAnime} onClose={() => setPlayingAnime(null)} />
            )}
        </>
    );
};

export default MyList;
