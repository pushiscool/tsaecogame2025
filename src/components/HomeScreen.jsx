import React, { useState, useEffect, useRef } from 'react';
import './HomeScreen.css';
import player1Img from './assets/player1.png';
import player2Img from './assets/player2.png';
import clouds from './assets/clouds.png';
import cans from './assets/cans.png';
import bottles from './assets/bottle.png';
import potion from './assets/potion.png';
import trash from './assets/trash.png';
import fish from './assets/fish.webp';
import heart from './assets/heart.png';

export default function HomeScreen() {
  const [mountains, setMountains] = useState([]);
  const [dynamicClouds, setDynamicClouds] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeybinds, setShowKeybinds] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [openLargeSea, setOpenLargeSea] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [sandHeight, setSandHeight] = useState(60);
  const [waterHovered, setWaterHovered] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [flash, setFlash] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const [gameObjects, setGameObjects] = useState([]);
  const [playerScale, setPlayerScale] = useState(1);
  const [mountainHovered, setMountainHovered] = useState(false);  
  const [openLargeMountain, setOpenLargeMountain] = useState(false);  
  const closeLargeMountain = () => setOpenLargeMountain(false);  

  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const brickWallRef = useRef(null);
  const keys = useRef({});

  const playerWidth = 62;
  const playerHeight = 80;
  const initialX = window.innerWidth / 2 - playerWidth / 2;
  const initialY = window.innerHeight - 200 - playerHeight;
  const p1 = useRef({ pos: { x: initialX, y: initialY }, vel: { x: 0, y: 0 }, grounded: true });
  const p2 = useRef({ pos: { x: initialX, y: initialY }, vel: { x: 0, y: 0 }, grounded: true });

  useEffect(() => {
    if (player1Ref.current) {
      player1Ref.current.style.left = `${p1.current.pos.x}px`;
      player1Ref.current.style.top = `${p1.current.pos.y}px`;
      player1Ref.current.style.transform = `scale(${playerScale})`;
    }
    if (player2Ref.current) {
      player2Ref.current.style.left = `${p2.current.pos.x}px`;
      player2Ref.current.style.top = `${p2.current.pos.y}px`;
      player2Ref.current.style.transform = `scale(${playerScale})`;
    }
  }, [playerScale]);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  useEffect(() => {
    const bubbleInterval = setInterval(() => {
      setBubbles(prev => [...prev, { id: Date.now(), left: Math.random() * 100 }]);
    }, 2000);
    return () => clearInterval(bubbleInterval);
  }, []);
  useEffect(() => {
    const cleanInterval = setInterval(() => {
      setBubbles(prev => prev.filter(b => Date.now() - b.id < 8000));
    }, 2000);
    return () => clearInterval(cleanInterval);
  }, []);

  const generateMountains = () => {
    let leftPos = 0;
    const arr = [];
    while (leftPos < 300) {
      const isFront = arr.length % 2 === 0;
      const h = isFront ? Math.floor(Math.random() * 150) + 2000 : Math.floor(Math.random() * 150) + 2650;
      const w = Math.floor(Math.random() * 200) + 1900;
      const s = Math.random() * 3;
      const l = leftPos + s;
      arr.push({ height: h, width: w, left: `${l}%`, isFront });
      leftPos = l + 7.5;
    }
    const mountainBefore = { height: Math.floor(Math.random() * 150) + 2000, width: Math.floor(Math.random() * 200) + 1900, left: '-5%', isFront: true };
    const mountainAfter = { height: Math.floor(Math.random() * 150) + 2000, width: Math.floor(Math.random() * 200) + 1900, left: '305%', isFront: false };
    arr.unshift(mountainBefore);
    arr.push(mountainAfter);
    return arr;
  };

  useEffect(() => {
    setMountains(generateMountains());
  }, []);

  useEffect(() => {
    const handleKeyDown = e => { keys.current[e.key] = true; };
    const handleKeyUp = e => { keys.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (openLargeSea) return;
    let frameId;
    const loop = () => {
      const homeScreen = document.getElementById('homescreen');
      if (!homeScreen) {
        frameId = requestAnimationFrame(loop);
        return;
      }
      const homeRect = homeScreen.getBoundingClientRect();
      if ((keys.current['w'] || keys.current['W']) && p1.current.grounded) {
        p1.current.vel.y = -15;
        p1.current.grounded = false;
      }
      if ((keys.current['s'] || keys.current['S']) && !p1.current.grounded) {
        p1.current.vel.y += 1;
      }
      if (keys.current['a'] || keys.current['A']) { p1.current.vel.x -= 0.3; }
      if (keys.current['d'] || keys.current['D']) { p1.current.vel.x += 0.3; }
      if (keys.current['ArrowUp'] && p2.current.grounded) {
        p2.current.vel.y = -15;
        p2.current.grounded = false;
      }
      if (keys.current['ArrowDown'] && !p2.current.grounded) {
        p2.current.vel.y += 1;
      }
      if (keys.current['ArrowLeft']) { p2.current.vel.x -= 0.3; }
      if (keys.current['ArrowRight']) { p2.current.vel.x += 0.3; }
      p1.current.vel.y += 0.05;
      p2.current.vel.y += 0.05;
      p1.current.vel.x *= 0.91;
      p1.current.vel.y *= 0.91;
      p2.current.vel.x *= 0.91;
      p2.current.vel.y *= 0.91;
      p1.current.pos.x += p1.current.vel.x;
      p1.current.pos.y += p1.current.vel.y;
      p2.current.pos.x += p2.current.vel.x;
      p2.current.pos.y += p2.current.vel.y;
      if (brickWallRef.current) {
        const wallRect = brickWallRef.current.getBoundingClientRect();
        const wallBounds = {
          top: wallRect.top - homeRect.top + 10,
          bottom: wallRect.bottom - homeRect.top + 10,
          left: wallRect.left - homeRect.left,
          right: wallRect.right - homeRect.left
        };
        handleCollision(p1.current, wallBounds);
        handleCollision(p2.current, wallBounds);
      }
      keepInBounds(p1.current, homeRect);
      keepInBounds(p2.current, homeRect);
      if (player1Ref.current) {
        player1Ref.current.style.left = `${p1.current.pos.x}px`;
        player1Ref.current.style.top = `${p1.current.pos.y}px`;
        player1Ref.current.style.transform = `scale(${playerScale})`;
      }
      if (player2Ref.current) {
        player2Ref.current.style.left = `${p2.current.pos.x}px`;
        player2Ref.current.style.top = `${p2.current.pos.y}px`;
        player2Ref.current.style.transform = `scale(${playerScale})`;
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [openLargeSea, playerScale]);

  function handleCollision(player, wallBounds) {
    const playerLeft = player.pos.x;
    const playerRight = player.pos.x + playerWidth;
    const playerTop = player.pos.y;
    const playerBottom = player.pos.y + playerHeight;
    const isColliding =
      playerRight > wallBounds.left &&
      playerLeft < wallBounds.right &&
      playerBottom > wallBounds.top &&
      playerTop < wallBounds.bottom;
    if (isColliding) {
      const overlapX = player.vel.x > 0 ? wallBounds.left - playerRight : wallBounds.right - playerLeft;
      const overlapY = player.vel.y > 0 ? wallBounds.top - playerBottom : wallBounds.bottom - playerTop;
      if (Math.abs(overlapX) < Math.abs(overlapY)) {
        player.pos.x += overlapX;
        player.vel.x = 0;
      } else {
        player.pos.y += overlapY;
        player.vel.y = 0;
        if (overlapY < 0) { player.grounded = true; }
      }
    } else {
      if (player.pos.y + playerHeight >= wallBounds.top) { player.grounded = false; }
    }
  }

  function keepInBounds(player, homeRect) {
    const gameWidth = homeRect.width;
    const gameHeight = homeRect.height + 200;
    if (player.pos.x < 0) { player.pos.x = 0; player.vel.x = 0; }
    if (player.pos.x + playerWidth > gameWidth) { player.pos.x = gameWidth - playerWidth; player.vel.x = 0; }
    if (player.pos.y < 0) { player.pos.y = 0; player.vel.y = 0; }
    if (player.pos.y + playerHeight > gameHeight) { player.pos.y = gameHeight - playerHeight; player.vel.y = 0; player.grounded = true; }
  }

  const rayCount = 18;
  const orbitRadius = 46;
  const minRayLength = 20;
  const maxRayLength = 25;
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = i * (360 / rayCount);
    const rayLength = Math.random() * (maxRayLength - minRayLength) + minRayLength;
    const randomDelay = Math.random() * 8;
    const randomDuration = Math.random() * 2 + 3;
    return (
      <div
        key={i}
        className="sun-ray"
        style={{
          width: `${rayLength}px`,
          transform: `rotate(${angle}deg) translateX(${orbitRadius}px)`,
          '--lineLength': `${rayLength}px`,
          animation: `bounce ${randomDuration}s linear infinite`,
          animationDelay: `${randomDelay}s`
        }}
      />
    );
  });

  const generateWavePath = shift => {
    const baseline = 300;
    let d = `M0 ${baseline}`;
    const segments = 6;
    const segmentWidth = 1200 / segments;
    for (let i = 0; i < segments; i++) {
      const x0 = i * segmentWidth;
      const x1 = x0 + segmentWidth / 3;
      const x2 = x0 + (2 * segmentWidth) / 3;
      const x3 = (i + 1) * segmentWidth;
      const amplitude = 40 * (i % 2 === 0 ? 1 : -1);
      const cp1X = x1 + shift;
      const cp2X = x2 + shift;
      const cp1Y = baseline + amplitude;
      const cp2Y = baseline + amplitude;
      d += ` C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${x3} ${baseline}`;
    }
    d += ` L1200 800 L0 800 Z`;
    return d;
  };
  const d1 = generateWavePath(0);

  useEffect(() => {
    if (gameStarted) {
      setSandHeight(60 + Math.floor(Math.random() * 10));
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    const intervalId = setInterval(() => {
      const id = Date.now() + Math.random();
      const newCloud = {
        id,
        top: Math.random() * 30 + 5,
        width: 100 + Math.random() * 50,
        duration: 40 + Math.random() * 20
      };
      setDynamicClouds(prev => [...prev, newCloud]);
      setTimeout(() => {
        setDynamicClouds(prev => prev.filter(c => c.id !== id));
      }, newCloud.duration * 1000);
    }, 500);
    return () => clearInterval(intervalId);
  }, [gameStarted]);

  useEffect(() => {
    if (!openLargeSea) return;
    const baseY = window.innerHeight - sandHeight;
    p1.current.pos = { x: window.innerWidth / 2 - playerWidth - 20, y: baseY - playerHeight };
    p1.current.vel = { x: 0, y: 0 };
    p2.current.pos = { x: window.innerWidth / 2 + 20, y: baseY - playerHeight };
    p2.current.vel = { x: 0, y: 0 };
    let seaFrameId;
    const seaLoop = () => {
      const seaDiv = document.getElementById('sea-game');
      if (!seaDiv) { seaFrameId = requestAnimationFrame(seaLoop); return; }
      const GRAVITY = 0.05;
      if (keys.current['w'] || keys.current['W']) { p1.current.vel.y = -2.5; }
      if (keys.current['a'] || keys.current['A']) { p1.current.vel.x = -1.5; }
      if (keys.current['d'] || keys.current['D']) { p1.current.vel.y = +2.5; }
      if (keys.current['s'] || keys.current['S']) { p1.current.vel.x = +1.5; }
      if (keys.current['ArrowUp']) { p2.current.vel.y = -2.5; }
      if (keys.current['ArrowLeft']) { p2.current.vel.x = -1.5; }
      if (keys.current['ArrowDown']) { p2.current.vel.y = +2.5; }
      if (keys.current['ArrowRight']) { p2.current.vel.x = +1.5; }
      p1.current.vel.y += GRAVITY;
      p2.current.vel.y += GRAVITY;
      p1.current.vel.x *= 0.95;
      p1.current.vel.y *= 0.95;
      p2.current.vel.x *= 0.95;
      p2.current.vel.y *= 0.95;
      p1.current.pos.x += p1.current.vel.x;
      p1.current.pos.y += p1.current.vel.y;
      p2.current.pos.x += p2.current.vel.x;
      p2.current.pos.y += p2.current.vel.y;
      const base = window.innerHeight - sandHeight;
      if (p1.current.pos.y + playerHeight > base) {
        p1.current.pos.y = base - playerHeight + 62.5;
        p1.current.vel.y = 0;
      }
      if (p2.current.pos.y + playerHeight > base) {
        p2.current.pos.y = base - playerHeight + 62.5;
        p2.current.vel.y = 0;
      }
      if (player1Ref.current) {
        player1Ref.current.style.left = `${p1.current.pos.x}px`;
        player1Ref.current.style.top = `${p1.current.pos.y}px`;
        player1Ref.current.style.transform = `scale(${playerScale})`;
      }
      if (player2Ref.current) {
        player2Ref.current.style.left = `${p2.current.pos.x}px`;
        player2Ref.current.style.top = `${p2.current.pos.y}px`;
        player2Ref.current.style.transform = `scale(${playerScale})`;
      }
      seaFrameId = requestAnimationFrame(seaLoop);
    };
    seaFrameId = requestAnimationFrame(seaLoop);
    return () => cancelAnimationFrame(seaFrameId);
  }, [openLargeSea, sandHeight, playerScale]);

  const handleSeaBoxClick = () => {
    setOpenLargeSea(true);
  };

  const closeLargeSea = () => {
    setOpenLargeSea(false);
  };

  useEffect(() => {
    if (!gameStarted || openLargeSea) return;
    let frameId;
    const checkCollisions = () => {
      gameObjects.forEach(obj => {
        const objSize = 40;
        [p1.current, p2.current].forEach(player => {
          const px = player.pos.x;
          const py = player.pos.y;
          if (
            obj.x < px + playerWidth * playerScale &&
            obj.x + objSize > px &&
            obj.y < py + playerHeight * playerScale &&
            obj.y + objSize > py
          ) {
            if (obj.type === 'trash') {
              setScore(prev => prev - 30);
              if (health > 0) setHealth(prev => prev - 1);
            } else if (obj.type === 'bottles') {
              setScore(prev => prev + 25);
            } else if (obj.type === 'cans') {
              setScore(prev => prev + 10);
            } else if (obj.type === 'potion') {
              setPlayerScale(0.5);
              setTimeout(() => setPlayerScale(1), 20000);
            }
            setFlash(true);
            setGameObjects(prev => prev.filter(o => o.id !== obj.id));
          }
        });
      });
      frameId = requestAnimationFrame(checkCollisions);
    };
    frameId = requestAnimationFrame(checkCollisions);
    return () => cancelAnimationFrame(frameId);
  }, [gameStarted, openLargeSea, gameObjects, health, playerScale]);

  useEffect(() => {
    if (!gameStarted) return;
    const spawnInterval = setInterval(() => {
      const types = ['cans', 'bottles', 'potion', 'trash', 'fish'];
      const type = types[Math.floor(Math.random() * types.length)];
      const x = Math.random() * (window.innerWidth - 50);
      const newObj = {
        id: Date.now() + Math.random(),
        type,
        x,
        y: -50,
        vy: 2 + Math.random() * 3,
        vx: Math.random() < 0.5 ? 1 : -1,
      };
      setGameObjects(prev => [...prev, newObj]);
    }, 2000);
    return () => clearInterval(spawnInterval);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    let frameId;
    const updateObjects = () => {
      setGameObjects(prev => prev
        .map(obj => ({ ...obj, x: obj.x + obj.vx, y: obj.y + obj.vy }))
        .filter(obj => obj.y < window.innerHeight + 50)
      );
      frameId = requestAnimationFrame(updateObjects);
    };
    frameId = requestAnimationFrame(updateObjects);
    return () => cancelAnimationFrame(frameId);
  }, [gameStarted]);

  if (gameStarted) {
    if (openLargeSea) {
      return (
        <div
          id="sea-game"
          style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            background: '#66ccff',
            overflow: 'hidden'
          }}
        >
          <div
            className="sand"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: `${sandHeight}px`,
              background: '#f4a460',
              zIndex: 50
            }}
          ></div>
          <button
            className="menu-button"
            onClick={closeLargeSea}
            style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}
          >
            Close Sea
          </button>
          <img
            ref={player1Ref}
            src={player1Img}
            alt="Player 1"
            className="player player1"
            style={{ width: `${playerWidth}px`, height: `${playerHeight}px`, zIndex: 100, transform: `scale(${playerScale})` }}
          />
          <img
            ref={player2Ref}
            src={player2Img}
            alt="Player 2"
            className="player player2"
            style={{ width: `${playerWidth}px`, height: `${playerHeight}px`, zIndex: 100, transform: `scale(${playerScale})` }}
          />
        </div>
      );
    }

    if (gameStarted) {  
  if (openLargeMountain) {  
    return (  
      <div  
        id="mountain-game"  
        style={{  
          position: 'relative',  
          width: '100vw',  
          height: '100vh',  
           background: 'linear-gradient(to bottom, #a8c0ff, #3f2b96)', // Mountain sky gradient  
          overflow: 'hidden'  
        }}  
      >  
        <button  
          className="menu-button"  
          onClick={closeLargeMountain}  
          style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}  
        >  
          Close Mountain  
        </button>  
        {/* Add mountain-specific elements and interactions here */}  
      </div>  
    );  
  }  
  // Continue with other game logic...  
}  



    
    return (
      <>
        <div className="game-start-screen" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <button className="menu-button" onClick={() => setGameStarted(false)}>Close</button>
          <div className="levels-container">
                        <div className="level-box"></div>
   <div className="level-box mountain-box"  
     onMouseEnter={() => setMountainHovered(true)}  
     onMouseLeave={() => setMountainHovered(false)}  
     onClick={() => setOpenLargeMountain(true)}  
     style={{ transform: mountainHovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s ease' }}>  
  <div className="title-container">  
    <div className="cover-text" style={{ fontSize: '28px', marginTop: '20px' }}>The Mountain</div>  
  </div>  
  <div className="mountain-peaks">  
    {Array.from({ length: 3 }).map((_, i) => (  
      <div key={i} className="peak" style={{ left: `${i * 30 + 10}%` }}></div>  
    ))}  
  </div>  
  <div className="clouds">  
    {Array.from({ length: 4 }).map((_, i) => {  
      const size = 10 + Math.random() * 20;  
      return (  
        <div  
          key={i}  
          className="cloud"  
          style={{  
            left: `${Math.random() * 100}%`,  
            top: `${Math.random() * 20 + 10}%`,  
            width: `${size}px`,  
            height: `${size}px`,  
            animationDelay: `${Math.random() * 2}s`  
          }}  
        ></div>  
      );  
    })}  
  </div>  
</div>  
            <div className="level-box"></div>
            <div
              className="level-box water-box"
              onMouseEnter={() => setWaterHovered(true)}
              onMouseLeave={() => setWaterHovered(false)}
              onClick={handleSeaBoxClick}
              style={{ transform: waterHovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s ease' }}
            >
              <div className="title-container">
                <div className="cover-text" style={{ fontSize: '28px', marginTop: '20px' }}>The Sea</div>
              </div>
              <div className="bubbles">
                {Array.from({ length: 12 }).map((_, i) => {
                  const size = 5 + Math.random() * 10;
                  return (
                    <div
                      key={i}
                      className="bubble"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animationDelay: `${Math.random() * 2}s`
                      }}
                    ></div>
                  );
                })}
              </div>
              <div className="sand" style={{ height: `${sandHeight}px` }}></div>
            </div>
            <div className="level-box bottom-level"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div id="homescreen">
      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Press Start 2P', cursive",
        fontSize: '24px',
        color: '#000',
        zIndex: 300
      }}>
        Score: {score}
      </div>
      {gameStarted && !openLargeSea && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: '10px',
          zIndex: 300
        }}>
          {Array.from({ length: health }).map((_, i) => (
            <img
              key={i}
              src={heart}
              alt="heart"
              style={{ width: '30px', height: '30px', animation: flash ? 'flash 2s' : 'none' }}
            />
          ))}
        </div>
      )}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 200
      }}>
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            style={{
              position: 'absolute',
              left: `${bubble.left}%`,
              bottom: 0,
              width: '20px',
              height: '20px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              animation: 'bubbleRise 8s linear'
            }}
          ></div>
        ))}
      </div>
      <div className="clouds-container">
        {dynamicClouds.map(cloud => (
          <img
            key={cloud.id}
            src={clouds}
            alt="cloud"
            className="cloud"
            style={{
              top: `${cloud.top}%`,
              left: `-${cloud.width}px`,
              width: `${cloud.width}px`,
              animationDuration: `${cloud.duration}s`
            }}
          />
        ))}
      </div>
      <div className="mountain-container">
        {mountains.map((m, i) => {
          const style = {
            position: 'absolute',
            bottom: `-${m.height / 1.2}px`,
            left: m.left,
            width: `${m.width}px`,
            height: `${m.height}px`,
            background: `radial-gradient(circle at 50% 80%, #158b34 20%, #0f6f28 85%, #0b4d1e 100%)`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.4), inset 0 -20px 30px rgba(0,0,0,0.5)`,
            borderRadius: '50% 50% 20% 20%',
            border: '8px solid rgba(0,0,0,0.5)',
            zIndex: m.isFront ? 2 : 1
          };
          return <div key={i} style={style} />;
        })}
      </div>
      <div className="brick-wall" ref={brickWallRef}></div>
      <div className="sun">{rays}</div>
      <div className="fullscreen-icon">
        <div className="hitbox" onClick={() => {
          if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); }
          else if (document.exitFullscreen) { document.exitFullscreen(); }
        }}></div>
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-right"></div>
        <div className="corner bottom-left"></div>
      </div>
      <div className="overlay">
        <div className="text-container">
          <div className="top-text">ECO</div>
          <div className="bottom-text">RESCUE</div>
        </div>
        <div className="pyramid-buttons">
          <button className="menu-button" onClick={() => setGameStarted(true)}>Start</button>
          <div className="lower-buttons">
            <button className="menu-button" onClick={() => setShowSettings(true)}>Settings</button>
            <button className="menu-button" onClick={() => setShowKeybinds(true)}>Keybinds</button>
          </div>
        </div>
      </div>
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Settings</h3>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '120px', textAlign: 'right', marginRight: '10px' }}>Music: {musicVolume}</div>
              <input id="musicSlider" type="range" min="0" max="100" value={musicVolume} onChange={e => setMusicVolume(Number(e.target.value))} />
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '120px', textAlign: 'right', marginRight: '10px' }}>SFX: {sfxVolume}</div>
              <input id="sfxSlider" type="range" min="0" max="100" value={sfxVolume} onChange={e => setSfxVolume(Number(e.target.value))} />
            </div>
            <button className="menu-button" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
      {showKeybinds && (
        <div className="settings-overlay" onClick={() => setShowKeybinds(false)}>
          <div className="settings-modal keybinds-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Keybinds</h3>
            <div className="keybinds-content">
              <div>
                <strong>Player 1 (W, A, D, S)</strong>
                <ul>
                  <li>Up: W</li>
                  <li>Left: A</li>
                  <li>Down: S</li>
                  <li>Right: D</li>
                </ul>
              </div>
              <div>
                <strong>Player 2 (Arrow Keys)</strong>
                <ul>
                  <li>Up: ↑</li>
                  <li>Left: ←</li>
                  <li>Down: ↓</li>
                  <li>Right: →</li>
                </ul>
              </div>
            </div>
            <button className="menu-button" onClick={() => setShowKeybinds(false)}>Close</button>
          </div>
        </div>
      )}
      <div className="water">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d={d1} fill="#0af" fillOpacity="0.6" />
        </svg>
      </div>
      <img ref={player1Ref} src={player1Img} alt="Player 1" className="player player1" style={{ width: `${playerWidth}px`, height: `${playerHeight}px`, transform: `scale(${playerScale})` }} />
      <img ref={player2Ref} src={player2Img} alt="Player 2" className="player player2" style={{ width: `${playerWidth}px`, height: `${playerHeight}px`, transform: `scale(${playerScale})` }} />
      {gameObjects.map(obj => (
        <img
          key={obj.id}
          src={
            obj.type === 'cans' ? cans :
            obj.type === 'bottles' ? bottles :
            obj.type === 'potion' ? potion :
            obj.type === 'trash' ? trash :
            obj.type === 'fish' ? fish : ''
          }
          alt={obj.type}
          style={{
            position: 'absolute',
            left: `${obj.x}px`,
            top: `${obj.y}px`,
            width: '40px',
            height: '40px',
            zIndex: 150
          }}
        />
      ))}
    </div>
  );
}
