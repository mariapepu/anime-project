import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = ({ animes = [], onPlay }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (animes.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 15000);

        return () => clearInterval(interval);
    }, [animes, currentIndex]);

    const handleNext = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev === animes.length - 1 ? 0 : prev + 1));
            setIsTransitioning(false);
        }, 500);
    };

    const handlePrev = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev === 0 ? animes.length - 1 : prev - 1));
            setIsTransitioning(false);
        }, 500);
    };

    if (!animes || animes.length === 0) return null;

    const currentAnime = animes[currentIndex];

    return (
        <div className='relative w-full h-[70vh] text-white overflow-hidden bg-[var(--background)]'>
            {/* Background Image with Transition */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className='absolute w-full h-full bg-gradient-to-r from-black via-transparent to-transparent z-10'></div>
                <div className="absolute w-full h-full bg-gradient-to-b from-transparent via-transparent to-[#141414] z-10 bottom-0" />
                <img
                    className='w-full h-full object-cover'
                    src={currentAnime.image}
                    alt={currentAnime.title}
                />
            </div>

            {/* Content with Transition */}
            <div className={`absolute w-full top-[30%] md:top-[25%] p-4 md:p-8 md:pl-16 z-20 transition-all duration-700 transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold max-w-[90%] md:max-w-[70%] drop-shadow-2xl'>
                    {currentAnime.title}
                </h1>

                <div className='my-6 flex gap-4'>
                    <button
                        onClick={() => onPlay(currentAnime)}
                        className='bg-[var(--primary)] text-black py-2 px-6 rounded font-bold flex items-center gap-2 hover:bg-opacity-80 transition active:scale-95'
                    >
                        <Play size={24} fill="black" /> Play
                    </button>
                    <button
                        onClick={() => navigate(`/title/${currentAnime.id}`)}
                        className='bg-[#9c7880]/60 text-white py-2 px-6 rounded font-bold flex items-center gap-2 hover:bg-[#8a6a72] transition backdrop-blur-md active:scale-95 border border-white/20'
                    >
                        <Info size={24} />
                        More Info
                    </button>
                </div>

                <p className='text-gray-300 text-sm mb-2 font-semibold'>
                    {currentAnime.year || '2024'} • {currentAnime.category} • {currentAnime.genres?.slice(0, 3).join(', ')}
                </p>
                <p className='w-full md:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%] text-gray-200 drop-shadow-md text-sm md:text-lg leading-relaxed line-clamp-3'>
                    {currentAnime.description}
                </p>
            </div>

            {/* Carousel Controls (Hidden on small screens, shown on hover/desktop) */}
            {animes.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full hover:bg-black/40 transition-all hidden md:block text-white/20 hover:text-white"
                    >
                        <ChevronLeft size={44} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full hover:bg-black/40 transition-all hidden md:block text-white/20 hover:text-white"
                    >
                        <ChevronRight size={44} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {animes.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setIsTransitioning(true);
                                    setTimeout(() => {
                                        setCurrentIndex(index);
                                        setIsTransitioning(false);
                                    }, 500);
                                }}
                                className={`h-1.5 transition-all duration-300 rounded-full ${index === currentIndex ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-gray-500 hover:bg-gray-300'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Hero;
