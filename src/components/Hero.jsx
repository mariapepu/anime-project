import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

const Hero = ({ anime, onPlay }) => {
    const navigate = useNavigate();

    if (!anime) return null;

    return (

        <div className='relative w-full h-[70vh] text-white'>
            <div className='w-full h-full'>
                <div className='absolute w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-10'></div>
                <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#141414] z-10 bottom-0" />
                <img
                    className='w-full h-full object-cover'
                    src={anime.image}
                    alt={anime.title}
                />
                <div className='absolute w-full top-[30%] md:top-[25%] p-4 md:p-8 md:pl-16 z-20'>
                    <h1 className='text-3xl md:text-5xl font-bold max-w-[90%] md:max-w-[60%] drop-shadow-lg'>{anime.title}</h1>
                    <div className='my-6 flex gap-4'>
                        <button
                            onClick={() => onPlay(anime)}
                            className='bg-[var(--primary)] text-black py-2 px-6 rounded font-bold flex items-center gap-2 hover:bg-opacity-80 transition'
                        >
                            <Play size={24} fill="black" /> Play
                        </button>
                        <button
                            onClick={() => navigate(`/title/${anime.id}`)}
                            className='bg-[#9c7880]/90 text-white py-2 px-6 rounded font-bold flex items-center gap-2 hover:bg-[#8a6a72] transition backdrop-blur-sm'
                        >
                            <Info size={24} />
                            More Info
                        </button>
                    </div>
                    <p className='text-gray-300 text-sm mb-2'>Released: {anime.year || '2023'}</p>
                    <p className='w-full md:max-w-[70%] lg:max-w-[45%] xl:max-w-[35%] text-gray-200 drop-shadow-md text-sm md:text-base'>
                        {anime.description?.slice(0, 160)}...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
