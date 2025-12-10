import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Row = ({ title, animes, onPlay }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div style={{ marginBottom: '3rem', padding: '0 4%' }}>
            <h2 style={{
                color: '#e5e5e5',
                marginBottom: '1rem',
                fontSize: '1.5rem',
                fontWeight: '600'
            }}>
                {title}
            </h2>

            <div style={{ position: 'relative', group: 'row' }}>
                <button
                    onClick={() => scroll('left')}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 40,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        padding: '0 0.5rem',
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                    <ChevronLeft size={40} />
                </button>

                <div
                    ref={rowRef}
                    style={{
                        display: 'flex',
                        gap: '0.5rem',
                        overflowX: 'scroll',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        padding: '1rem 1rem',
                        scrollBehavior: 'smooth'
                    }}
                    className="no-scrollbar"
                >
                    {animes.map((anime) => (
                        <div
                            key={anime.id}
                            onClick={() => onPlay(anime)}
                            style={{
                                flex: '0 0 auto',
                                width: '250px',
                                cursor: 'pointer',
                                transition: 'transform 0.3s',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img
                                src={anime.image}
                                alt={anime.title}
                                style={{
                                    width: '100%',
                                    height: '140px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                }}
                            />
                            <p style={{
                                marginTop: '0.5rem',
                                color: '#999',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {anime.title}
                            </p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => scroll('right')}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        zIndex: 40,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        border: 'none',
                        padding: '0 0.5rem',
                        cursor: 'pointer',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                    <ChevronRight size={40} />
                </button>
            </div>
        </div>
    );
};

export default Row;
