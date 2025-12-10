import React from 'react';
import { Play, Info } from 'lucide-react';

const Hero = ({ anime, onPlay }) => {
    if (!anime) return null;

    return (
        <div style={{
            position: 'relative',
            height: '80vh',
            width: '100%',
            color: 'white',
            backgroundImage: `linear-gradient(to bottom, rgba(20,20,20,0) 50%, rgba(20,20,20,1) 100%), url(${anime.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
        }}>
            <div className="container" style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '1.5rem',
                paddingTop: '60px'
            }}>
                <h1 style={{
                    fontSize: '4rem',
                    fontWeight: '800',
                    maxWidth: '600px',
                    lineHeight: '1.1',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                    {anime.title}
                </h1>

                <p style={{
                    fontSize: '1.2rem',
                    maxWidth: '600px',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: '1.5'
                }}>
                    {anime.description}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => onPlay(anime)}
                    >
                        <Play size={24} fill="currentColor" />
                        Play
                    </button>
                    <button className="btn btn-secondary">
                        <Info size={24} />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
