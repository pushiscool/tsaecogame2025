import React, { useState, useEffect } from 'react';
import cans from './assets/cans.png';
import bottles from './assets/bottle.png';
import potion from './assets/potion.png';
import trash from './assets/trash.png';
import fish from './assets/fish.png';
import heart from './assets/heart.png';

const HomeScreen = () => {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [flash, setFlash] = useState(false);
  const [playerSize, setPlayerSize] = useState(1);
  const [bubbles, setBubbles] = useState([]);
  const gravity = 0.3;

  useEffect(() => {
    const bubbleInterval = setInterval(() => {
      setBubbles(bubs => [...bubs, { id: Date.now(), left: Math.random() * 100, delay: Math.random() * 2 }]);
    }, 500);
    return () => clearInterval(bubbleInterval);
  }, []);

  useEffect(() => {
    const cleanInterval = setInterval(() => {
      setBubbles(bubs => bubs.filter(b => Date.now() - b.id < 4000));
    }, 1000);
    return () => clearInterval(cleanInterval);
  }, []);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const handleCollision = type => {
    if (type === 'trash') {
      setScore(prev => prev - 30);
      if (hearts > 0) setHearts(prev => prev - 1);
    } else if (type === 'bottles') {
      setScore(prev => prev + 25);
    } else if (type === 'cans') {
      setScore(prev => prev + 10);
    } else if (type === 'potion') {
      setPlayerSize(0.5);
      setTimeout(() => setPlayerSize(1), 20000);
    }
    setFlash(true);
  };

  return (
    <div id="homescreen">
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Press Start 2P', cursive",
          fontSize: '24px',
          color: '#000'
        }}
      >
        Score: {score}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: '10px'
        }}
      >
        {Array.from({ length: hearts }).map((_, i) => (
          <img
            key={i}
            src={heart}
            alt="heart"
            style={{
              width: 30,
              height: 30,
              animation: flash ? 'flash 2s' : 'none'
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${playerSize})`,
          display: 'flex',
          gap: '50px',
          opacity: flash ? 0.5 : 1,
          transition: 'opacity 0.2s, transform 0.2s'
        }}
      >
        <div
          className="player"
          style={{
            width: 80,
            height: 80,
            background: 'blue',
            borderRadius: '50%'
          }}
        />
        <div
          className="player"
          style={{
            width: 80,
            height: 80,
            background: 'red',
            borderRadius: '50%'
          }}
        />
      </div>
      <div
        className="bubbles"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            style={{
              position: 'absolute',
              left: `${bubble.left}%`,
              bottom: 0,
              width: 20,
              height: 20,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              animation: 'bubbleRise 4s ease-in',
              animationDelay: `${bubble.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeScreen;