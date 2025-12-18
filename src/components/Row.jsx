import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Row = ({ title, animes, onPlay, isPlayableCard, showRank }) => {
    const rowRef = useRef(null);
    const navigate = useNavigate();

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
                        gap: showRank ? '3.5rem' : '0.5rem',
                        overflowX: 'scroll',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        padding: showRank ? '1rem 2.5rem' : '1rem 1rem', // Responsive padding for numbers
                        scrollBehavior: 'smooth'
                    }}
                    className="no-scrollbar"
                >
                    {animes.map((anime, index) => {
                        // Helper to check if a date is within the last 7 days
                        const isRecent = (dateStr) => {
                            if (!dateStr) return false;
                            const date = new Date(dateStr);
                            const now = new Date();
                            const diffDays = (now - date) / (1000 * 60 * 60 * 24);
                            return diffDays >= 0 && diffDays <= 7;
                        };

                        const shouldShowNewBadge = isRecent(anime.createdAt) && anime.category === 'Movie';
                        const shouldShowNewEpisodeBadge = isRecent(anime.lastEpisodeAt) && anime.category === 'Series';

                        return (
                            <div
                                key={anime.id}
                                onClick={() => isPlayableCard ? onPlay(anime) : navigate(`/title/${anime.id}`)}
                                className="anime-card"
                                style={{
                                    flex: '0 0 auto',
                                    width: '250px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                            >
                                {/* New Badges */}
                                {shouldShowNewBadge && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px', // Slightly adjusted from 10px to give shadow room
                                        left: '12px', // Slightly adjusted from 10px to give shadow room
                                        backgroundColor: '#FFB6C1',
                                        color: '#141414',
                                        padding: '2px 10px',
                                        fontSize: '0.65rem',
                                        fontWeight: '900',
                                        borderRadius: '4px', // Increased rounding
                                        zIndex: 30,
                                        textTransform: 'uppercase',
                                        boxShadow: '0 0 6px rgba(0, 0, 0, 0.9)' // Deeper shadow, less spread
                                    }}>
                                        NEW
                                    </div>
                                )}
                                {shouldShowNewEpisodeBadge && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        backgroundColor: '#FFB6C1',
                                        color: '#141414',
                                        padding: '2px 10px',
                                        fontSize: '0.65rem',
                                        fontWeight: '900',
                                        borderRadius: '4px', // Increased rounding
                                        zIndex: 30,
                                        textTransform: 'uppercase',
                                        boxShadow: '0 0 6px rgba(0, 0, 0, 0.9)' // Deeper shadow, less spread
                                    }}>
                                        NEW EPIS.
                                    </div>
                                )}

                                {showRank && (
                                    <div
                                        className="rank-number"
                                        style={{
                                            position: 'absolute',
                                            left: '-2.5rem',
                                            bottom: '14px',
                                            zIndex: 20,
                                            fontSize: '8rem',
                                            fontWeight: '900',
                                            background: 'linear-gradient(to right, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 0.3) 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            WebkitTextStroke: '2px #FFB6C1',
                                            width: 'fit-content',
                                            height: 'auto',
                                            padding: '0.2rem 0.5rem', // Extra space for stroke and curves
                                            userSelect: 'none',
                                            pointerEvents: 'none',
                                            lineHeight: '1', // Increased to prevent vertical clipping
                                            fontFamily: 'system-ui, sans-serif',
                                            transition: 'all 0.3s ease',
                                            overflow: 'visible'
                                        }}
                                    >
                                        {index + 1}
                                    </div>
                                )}
                                <img
                                    className="anime-image"
                                    src={anime.image}
                                    alt={anime.title}
                                    style={{
                                        width: '100%',
                                        height: '140px',
                                        objectFit: 'cover',
                                        position: 'relative',
                                        zIndex: 10
                                    }}
                                />
                                <p style={{
                                    marginTop: '0.5rem',
                                    color: '#999',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    paddingLeft: '0.5rem' // Standard slight padding
                                }}>
                                    {anime.title}
                                </p>

                            </div>
                        );
                    })}
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
