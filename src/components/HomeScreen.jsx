import React, { useState, useEffect, useRef, useCallback } from "react";
import "./HomeScreen.css";
import player1Img from "./assets/player1.png";
import player2Img from "./assets/player2.png";
import clouds from "./assets/clouds.png";
import cans from "./assets/cans.png";
import bottles from "./assets/bottle.png";
import potion from "./assets/potion.png";
import trash from "./assets/trash.png";
import fish from "./assets/fish.webp";
import heart from "./assets/heart.png";
// Note: plane is imported for a different level and not used here.
import plane from "./assets/plane.png";

export default function HomeScreen() {
  // Basic game states
  const [mountains, setMountains] = useState([]);
  const [dynamicClouds, setDynamicClouds] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [openLargeSea, setOpenLargeSea] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(50);
  const [health, setHealth] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [flash, setFlash] = useState(false);
  const [gameObjects, setGameObjects] = useState([]);
  const [playerScale, setPlayerScale] = useState(1);
  const [stunned1, setStunned1] = useState(false);
  const [stunned2, setStunned2] = useState(false);
  const [mountainHovered, setMountainHovered] = useState(false);
  const [waterHovered, setWaterHovered] = useState(false);
  // Invincibility for players
  const [invincible1, setInvincible1] = useState(false);
  const [invincibilityTime1, setInvincibilityTime1] = useState(0);
  const [invincible2, setInvincible2] = useState(false);
  const [invincibilityTime2, setInvincibilityTime2] = useState(0);
  // Track if Player 1’s immunity comes from a potion
  const [potionImmunity1, setPotionImmunity1] = useState(false);

  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const brickWallRef = useRef(null);
  const keys = useRef({});

  // Refs for scheduling immunity removal for forced immunity only.
  const removalScheduled1Ref = useRef(false);
  const removalScheduled2Ref = useRef(false);

  // Define missing invincibilityTimerRef2
  const invincibilityTimerRef2 = useRef(null);

  // Dimensions and spawn points
  const playerWidth = 62;
  const playerHeight = 80;
  const spawnPoint1 = {
    x: window.innerWidth / 2 - playerWidth / 2 - 40,
    y: window.innerHeight / 2 - playerHeight / 2,
  };
  const spawnPoint2 = {
    x: window.innerWidth / 2 - playerWidth / 2 + 40,
    y: window.innerHeight / 2 - playerHeight / 2,
  };
  const p1 = useRef({ pos: { ...spawnPoint1 }, vel: { x: 0, y: 0 } });
  const p2 = useRef({ pos: { ...spawnPoint2 }, vel: { x: 0, y: 0 } });

  // Ref to hold latest timeLeft
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Limit total potions spawned to 3.
  const potionCountRef = useRef(0);

  // Sun rays for background.
  const rayCount = 18;
  const orbitRadius = 46;
  const minRayLength = 20;
  const maxRayLength = 25;
  const rays = Array.from({ length: rayCount }, (_, i) => {
    const angle = i * (360 / rayCount);
    const rayLength =
      Math.random() * (maxRayLength - minRayLength) + minRayLength;
    const randomDelay = Math.random() * 8;
    const randomDuration = Math.random() * 2 + 3;
    return (
      <div
        key={i}
        className="sun-ray"
        style={{
          width: `${rayLength}px`,
          transform: `rotate(${angle}deg) translateX(${orbitRadius}px)`,
          "--lineLength": `${rayLength}px`,
          animation: `bounce ${randomDuration}s linear infinite`,
          animationDelay: `${randomDelay}s`,
        }}
      />
    );
  });

  const handleSeaBoxClick = () => {
    setOpenLargeSea(true);
  };

  // Reset level and return to main home screen.
  const closeLargeSea = () => {
    setOpenLargeSea(false);
    setGameObjects([]);
    setHealth(3);
    setScore(0);
    setGameOver(false);
    setTimeLeft(60);
    p1.current.pos = { ...spawnPoint1 };
    p2.current.pos = { ...spawnPoint2 };
    p1.current.vel = { x: 0, y: 0 };
    p2.current.vel = { x: 0, y: 0 };
    setPaused(false);
    setGameStarted(false);
    potionCountRef.current = 0;
  };

  // For Player 1: When a potion is collected, stack immunity (add 5 sec if already immune).
  const invincibilityTimerRef1 = useRef(null);
  const startPotionImmunity1 = () => {
    if (potionImmunity1) {
      // Stack the immunity by adding 5 seconds
      setInvincibilityTime1(prev => prev + 5);
    } else {
      setPotionImmunity1(true);
      setInvincible1(true);
      setInvincibilityTime1(5);
      invincibilityTimerRef1.current = setInterval(() => {
        setInvincibilityTime1(prev => {
          if (prev <= 1) {
            clearInterval(invincibilityTimerRef1.current);
            setInvincible1(false);
            setPotionImmunity1(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // For Player 2: Standard immunity (no stacking, no red text)
  const startInvincibility2 = () => {
    if (invincibilityTimerRef2.current)
      clearInterval(invincibilityTimerRef2.current);
    setInvincible2(true);
    setInvincibilityTime2(5);
    invincibilityTimerRef2.current = setInterval(() => {
      setInvincibilityTime2(prev => {
        if (prev <= 1) {
          clearInterval(invincibilityTimerRef2.current);
          setInvincible2(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Check removal functions for forced immunity (only applied if not from potion)
  const checkRemovalForP1 = useCallback(() => {
    if (!stunned1 && invincible1 && !potionImmunity1 && !removalScheduled1Ref.current) {
      if (Math.abs(p1.current.vel.x) > 0.1 || Math.abs(p1.current.vel.y) > 0.1) {
        removalScheduled1Ref.current = true;
        setTimeout(() => {
          setInvincible1(false);
          removalScheduled1Ref.current = false;
        }, 1000);
      }
    }
  }, [stunned1, invincible1, potionImmunity1]);

  const checkRemovalForP2 = useCallback(() => {
    if (!stunned2 && invincible2 && !removalScheduled2Ref.current) {
      if (Math.abs(p2.current.vel.x) > 0.1 || Math.abs(p2.current.vel.y) > 0.1) {
        removalScheduled2Ref.current = true;
        setTimeout(() => {
          setInvincible2(false);
          removalScheduled2Ref.current = false;
        }, 1000);
      }
    }
  }, [stunned2, invincible2]);

  useEffect(() => {
    setMountains(generateMountains());
  }, []);

  useEffect(() => {
    if (player1Ref.current) {
      player1Ref.current.style.left = `${p1.current.pos.x}px`;
      player1Ref.current.style.top = `${p1.current.pos.y}px`;
      player1Ref.current.style.transform = `scale(${playerScale})`;
      player1Ref.current.style.animation = stunned1 ? "flash 1s 3" : "none";
    }
    if (player2Ref.current) {
      player2Ref.current.style.left = `${p2.current.pos.x}px`;
      player2Ref.current.style.top = `${p2.current.pos.y}px`;
      player2Ref.current.style.transform = `scale(${playerScale})`;
      player2Ref.current.style.animation = stunned2 ? "flash 1s 3" : "none";
    }
  }, [playerScale, stunned1, stunned2]);

  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  useEffect(() => {
    if (!gameStarted) {
      setGameObjects([]);
      setHealth(3);
      setScore(0);
      setTimeLeft(60);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (!openLargeSea) {
      setGameObjects([]);
    }
  }, [openLargeSea]);

  const generateMountains = () => {
    let leftPos = 0;
    const arr = [];
    while (leftPos < 300) {
      const isFront = arr.length % 2 === 0;
      const h = isFront
        ? Math.floor(Math.random() * 150) + 2000
        : Math.floor(Math.random() * 150) + 2650;
      const w = Math.floor(Math.random() * 200) + 1900;
      const s = Math.random() * 3;
      const l = leftPos + s;
      arr.push({ height: h, width: w, left: `${l}%`, isFront });
      leftPos = l + 7.5;
    }
    const mountainBefore = {
      height: Math.floor(Math.random() * 150) + 2000,
      width: Math.floor(Math.random() * 200) + 1900,
      left: "-5%",
      isFront: true,
    };
    const mountainAfter = {
      height: Math.floor(Math.random() * 150) + 2000,
      width: Math.floor(Math.random() * 200) + 1900,
      left: "305%",
      isFront: false,
    };
    arr.unshift(mountainBefore);
    arr.push(mountainAfter);
    return arr;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.repeat &&
        (e.key === "w" ||
          e.key === "W" ||
          e.key === "s" ||
          e.key === "S" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown")
      )
        return;
      if (e.shiftKey) {
        if (e.key === "w" || e.key === "W") {
          p1.current.vel.y = -2.5;
        } else if (e.key === "s" || e.key === "S") {
          p1.current.vel.y = 2.5;
        } else if (e.key === "a" || e.key === "A") {
          p1.current.vel.x = -2.5;
        } else if (e.key === "d" || e.key === "D") {
          p1.current.vel.x = 2.5;
        } else if (e.key === "ArrowUp") {
          p2.current.vel.y = -2.5;
        } else if (e.key === "ArrowDown") {
          p2.current.vel.y = 2.5;
        } else if (e.key === "ArrowLeft") {
          p2.current.vel.x = -2.5;
        } else if (e.key === "ArrowRight") {
          p2.current.vel.x = 2.5;
        }
        return;
      }
      if (e.key === "a" || e.key === "A") {
        keys.current[e.key] = true;
        p1.current.vel.x = -2.5;
      } else if (e.key === "d" || e.key === "D") {
        keys.current[e.key] = true;
        p1.current.vel.x = 2.5;
      } else if (e.key === "ArrowLeft") {
        keys.current[e.key] = true;
        p2.current.vel.x = -2.5;
      } else if (e.key === "ArrowRight") {
        keys.current[e.key] = true;
        p2.current.vel.x = 2.5;
      } else if (e.key === "w" || e.key === "W") {
        p1.current.vel.y = -2.5;
      } else if (e.key === "s" || e.key === "S") {
        p1.current.vel.y = 2.5;
      } else if (e.key === "ArrowUp") {
        p2.current.vel.y = -2.5;
      } else if (e.key === "ArrowDown") {
        p2.current.vel.y = 2.5;
      }
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handlePause = (e) => {
      if (e.key === "Escape" && openLargeSea) {
        setPaused((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handlePause);
    return () => window.removeEventListener("keydown", handlePause);
  }, [openLargeSea]);

  useEffect(() => {
    window.addEventListener("blur", () => setPaused(true));
    return () => window.removeEventListener("blur", () => setPaused(true));
  }, []);

  // Spawn objects only when in-level and not paused.
  useEffect(() => {
    if (!gameStarted || !openLargeSea || paused) return;
    const types = ["cans", "bottles", "potion", "trash", "fish"];
    const spawnInterval = setInterval(() => {
      let type = types[Math.floor(Math.random() * types.length)];
      if (type === "potion") {
        if (potionCountRef.current >= 3) {
          type = types[Math.floor(Math.random() * types.length)];
          if (type === "potion") return;
        } else {
          potionCountRef.current++;
        }
      }
      let x, y, vx, vy, size = 60, phase = Math.random() * Math.PI * 2;
      if (type === "fish") {
        x = window.innerWidth + 20;
        y = Math.random() * (window.innerHeight - 200) + 100;
        vx = -2;
        vy = 0;
      } else {
        x = Math.random() * (window.innerWidth - 50);
        y = -50;
        vx = Math.random() < 0.5 ? 1 : -1;
        vy = 2 + Math.random() * 3;
      }
      const newObj = { id: Date.now() + Math.random(), type, x, y, vx, vy, size, phase };
      setGameObjects(prev => [...prev, newObj]);
      // In the last 20 seconds, spawn extra objects from the left and right.
      if (timeLeftRef.current <= 20) {
        const extraTypes = ["cans", "bottles", "potion", "trash", "fish"];
        let extraType1 = extraTypes[Math.floor(Math.random() * extraTypes.length)];
        let extraType2 = extraTypes[Math.floor(Math.random() * extraTypes.length)];
        if (extraType1 === "potion" && potionCountRef.current >= 3)
          extraType1 = "cans";
        if (extraType2 === "potion" && potionCountRef.current >= 3)
          extraType2 = "cans";
        let leftObj = {
          id: Date.now() + Math.random(),
          type: extraType1,
          x: -50,
          y: Math.random() * 200,
          vy: 2 + Math.random() * 3,
          vx: 2,
          size: 60,
          phase: Math.random() * Math.PI * 2,
        };
        let rightObj = {
          id: Date.now() + Math.random(),
          type: extraType2,
          x: window.innerWidth + 50,
          y: Math.random() * 200,
          vy: 2 + Math.random() * 3,
          vx: -2,
          size: 60,
          phase: Math.random() * Math.PI * 2,
        };
        setGameObjects(prev => [...prev, leftObj, rightObj]);
      }
    }, 1500);
    return () => clearInterval(spawnInterval);
  }, [gameStarted, openLargeSea, paused, potionImmunity1]);

  // Update objects: move them based on their velocity.
  useEffect(() => {
    if (!openLargeSea) return;
    let frameId;
    const updateObjects = () => {
      if (paused) {
        frameId = requestAnimationFrame(updateObjects);
        return;
      }
      setGameObjects(prev =>
        prev
          .map(obj => {
            if (obj.type === "fish") {
              return {
                ...obj,
                x: obj.x + obj.vx,
                y: obj.y + Math.sin(Date.now() / 500 + obj.phase) * 0.5,
              };
            }
            return { ...obj, x: obj.x + obj.vx, y: obj.y + obj.vy };
          })
          .filter(
            (obj) =>
              obj.x + (obj.size || 60) > 0 &&
              obj.x < window.innerWidth + 50
          )
      );
      frameId = requestAnimationFrame(updateObjects);
    };
    frameId = requestAnimationFrame(updateObjects);
    return () => cancelAnimationFrame(frameId);
  }, [openLargeSea, paused]);

  // Collision detection – only process collisions for players who are not invincible.
  useEffect(() => {
    if (!openLargeSea || paused || gameOver) return;
    let collisionFrameId;
    const checkCollisions = () => {
      const processed = new Set();
      setGameObjects(prev => {
        const remaining = [];
        prev.forEach(obj => {
          if (processed.has(obj.id)) return;
          const objSize = obj.size || 60;
          const p1Collision = p1.current.pos.x < obj.x + objSize &&
                              p1.current.pos.x + playerWidth > obj.x &&
                              p1.current.pos.y < obj.y + objSize &&
                              p1.current.pos.y + playerHeight > obj.y;
          const p2Collision = p2.current.pos.x < obj.x + objSize &&
                              p2.current.pos.x + playerWidth > obj.x &&
                              p2.current.pos.y < obj.y + objSize &&
                              p2.current.pos.y + playerHeight > obj.y;
          const collisionP1 = p1Collision && !invincible1;
          const collisionP2 = p2Collision && !invincible2;
          if (collisionP1 || collisionP2) {
            processed.add(obj.id);
            if (obj.type === "cans") {
              if (collisionP1) setScore(s => s + 10);
              if (collisionP2) setScore(s => s + 10);
            } else if (obj.type === "bottles") {
              if (collisionP1) setScore(s => s + 25);
              if (collisionP2) setScore(s => s + 25);
            } else if (obj.type === "trash") {
              if (collisionP1 || collisionP2) {
                setScore(s => s - 30);
                setHealth(h => {
                  const newH = h - 1;
                  if (newH <= 0) setGameOver(true);
                  return newH;
                });
              }
            } else if (obj.type === "fish") {
              if (collisionP1 || collisionP2) {
                setScore(s => s - 15);
                setHealth(h => {
                  const newH = h - 1;
                  if (newH <= 0) setGameOver(true);
                  return newH;
                });
              }
            } else if (obj.type === "potion") {
              if (collisionP1) {
                // For Player 1, grant stacking potion immunity.
                startPotionImmunity1();
              }
              if (collisionP2) {
                // For Player 2, use standard immunity.
                startInvincibility2();
              }
            }
          } else {
            remaining.push(obj);
          }
        });
        return remaining;
      });
      collisionFrameId = requestAnimationFrame(checkCollisions);
    };
    collisionFrameId = requestAnimationFrame(checkCollisions);
    return () => cancelAnimationFrame(collisionFrameId);
  }, [openLargeSea, paused, invincible1, invincible2, gameOver]);

  // Sea loop: update players and boundaries.
  useEffect(() => {
    if (!openLargeSea) return;
    let seaFrameId;
    const seaLoop = () => {
      if (paused) {
        seaFrameId = requestAnimationFrame(seaLoop);
        return;
      }
      const GRAVITY = 0.05;
      if (!stunned1) {
        if (keys.current["a"] || keys.current["A"]) {
          p1.current.vel.x = -2.5;
        }
        if (keys.current["d"] || keys.current["D"]) {
          p1.current.vel.x = 2.5;
        }
        if (keys.current["w"] || keys.current["W"]) {
          p1.current.vel.y = -2.5;
        }
        if (keys.current["s"] || keys.current["S"]) {
          p1.current.vel.y = 2.5;
        }
        p1.current.vel.y += GRAVITY;
        p1.current.vel.x *= 0.95;
        p1.current.vel.y *= 0.95;
        p1.current.pos.x += p1.current.vel.x;
        p1.current.pos.y += p1.current.vel.y;
      }
      if (!stunned2) {
        if (keys.current["ArrowLeft"]) {
          p2.current.vel.x = -2.5;
        }
        if (keys.current["ArrowRight"]) {
          p2.current.vel.x = 2.5;
        }
        if (keys.current["ArrowUp"]) {
          p2.current.vel.y = -2.5;
        }
        if (keys.current["ArrowDown"]) {
          p2.current.vel.y = 2.5;
        }
        p2.current.vel.y += GRAVITY;
        p2.current.vel.x *= 0.95;
        p2.current.vel.y *= 0.95;
        p2.current.pos.x += p2.current.vel.x;
        p2.current.pos.y += p2.current.vel.y;
      }
      if (p1.current.pos.x < 0) p1.current.pos.x = 0;
      if (p1.current.pos.x > window.innerWidth - playerWidth)
        p1.current.pos.x = window.innerWidth - playerWidth;
      if (p1.current.pos.y < 0) p1.current.pos.y = 0;
      if (p2.current.pos.x < 0) p2.current.pos.x = 0;
      if (p2.current.pos.x > window.innerWidth - playerWidth)
        p2.current.pos.x = window.innerWidth - playerWidth;
      if (p2.current.pos.y < 0) p2.current.pos.y = 0;
      
      // If a player falls off, reset them, mark as stunned, and grant forced immunity.
      if (p1.current.pos.y > window.innerHeight) {
        setHealth(h => {
          const newH = h - 1;
          if (newH <= 0) setGameOver(true);
          return newH;
        });
        p1.current.pos = { ...spawnPoint1 };
        p1.current.vel = { x: 0, y: 0 };
        setStunned1(true);
        setInvincible1(true);
        removalScheduled1Ref.current = false;
        setTimeout(() => setStunned1(false), 3000);
      }
      if (p2.current.pos.y > window.innerHeight) {
        setHealth(h => {
          const newH = h - 1;
          if (newH <= 0) setGameOver(true);
          return newH;
        });
        p2.current.pos = { ...spawnPoint2 };
        p2.current.vel = { x: 0, y: 0 };
        setStunned2(true);
        setInvincible2(true);
        removalScheduled2Ref.current = false;
        setTimeout(() => setStunned2(false), 3000);
      }
      
      // Check if players have started moving to remove forced immunity.
      checkRemovalForP1();
      checkRemovalForP2();
      
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
  }, [openLargeSea, playerScale, stunned1, stunned2, paused, checkRemovalForP1, checkRemovalForP2]);

  useEffect(() => {
    if (gameStarted) {
      setScore(0);
      setTimeLeft(60);
      setHealth(3);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (openLargeSea && !gameOver && !paused) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [openLargeSea, gameOver, paused]);

  const generateWavePath = (shift) => {
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

  // In the game over screen, change the win condition to 250 points.
  if (gameStarted) {
    if (openLargeSea) {
      if (gameOver) {
        return (
          <div
            id="sea-game"
            style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.8)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "'Press Start 2P', cursive",
            }}
          >
            <h1 style={{ color: "red" }}>LEVEL FAILED</h1>
            <h2>
              Needed {250 - score > 0 ? 250 - score : 0} points to win. Score: {score}
            </h2>
            <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
              <button
                className="menu-button"
                onClick={() => {
                  setGameOver(false);
                  setHealth(3);
                  setScore(0);
                  p1.current.pos = { ...spawnPoint1 };
                  p2.current.pos = { ...spawnPoint2 };
                  setOpenLargeSea(true);
                }}
              >
                Retry
              </button>
              <button className="menu-button" onClick={closeLargeSea}>
                Home
              </button>
            </div>
          </div>
        );
      }
      return (
        <div
          id="sea-game"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            background: "#66ccff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "24px",
              color: "#000",
            }}
          >
            Score: {score} | Time: {timeLeft}s
          </div>
          {/* Show red immunity text for Player 1 if immunity comes from a potion */}
          {potionImmunity1 && (
            <div
              style={{
                position: "absolute",
                top: 60,
                left: "30%",
                transform: "translateX(-50%)",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "20px",
                color: "red",
              }}
            >
              Player One has immunity for {invincibilityTime1}s
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
              {Array.from({ length: health }).map((_, i) => (
                <img key={`heart-${i}`} src={heart} alt="heart" style={{ width: "30px", height: "30px" }} />
              ))}
            </div>
          </div>
          <button
            className="menu-button"
            onClick={() => {
              setOpenLargeSea(false);
              setGameStarted(false);
            }}
            style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}
          >
            Close Sea
          </button>
          <img
            ref={player1Ref}
            src={player1Img}
            alt="Player 1"
            className="player player1"
            style={{
              width: `${playerWidth}px`,
              height: `${playerHeight}px`,
              zIndex: 100,
              transform: `scale(${playerScale})`,
            }}
          />
          <img
            ref={player2Ref}
            src={player2Img}
            alt="Player 2"
            className="player player2"
            style={{
              width: `${playerWidth}px`,
              height: `${playerHeight}px`,
              zIndex: 100,
              transform: `scale(${playerScale})`,
            }}
          />
          {health > 0 &&
            gameObjects.map((obj) => (
              <img
                key={obj.id}
                src={
                  obj.type === "cans"
                    ? cans
                    : obj.type === "bottles"
                    ? bottles
                    : obj.type === "potion"
                    ? potion
                    : obj.type === "trash"
                    ? trash
                    : obj.type === "fish"
                    ? fish
                    : ""
                }
                alt={obj.type}
                style={{
                  position: "absolute",
                  left: `${obj.x}px`,
                  top: `${obj.y}px`,
                  width: obj.size ? `${obj.size}px` : "60px",
                  height: obj.size ? `${obj.size}px` : "60px",
                  zIndex: 1000,
                }}
              />
            ))}
          {paused && (
            <div className="pause-overlay">
              <h1>PAUSED</h1>
              <button className="menu-button" onClick={() => {
                setOpenLargeSea(false);
                setGameStarted(false);
              }}>
                Home
              </button>
              <button className="menu-button" onClick={() => setPaused(false)}>
                Resume
              </button>
            </div>
          )}
        </div>
      );
    }
    // Non-game start screen: LEVEL SELECTOR with five boxes.
    return (
      <div className="game-start-screen" style={{ background: "rgba(0,0,0,0.5)" }}>
        <button className="menu-button" onClick={() => setGameStarted(false)}>
          Close
        </button>
        <div className="levels-container">
          <div className="level-box ground-box">
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                THE GROUND
              </div>
            </div>
          </div>
          <div className="level-box mountain-box">
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                THE MOUNTAINS
              </div>
            </div>
          </div>
          <div className="level-box sea-box" onClick={handleSeaBoxClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                THE SEA
              </div>
            </div>
          </div>
          <div className="level-box sky-box">
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                THE SKY
              </div>
            </div>
          </div>
          <div className="level-box sun-box">
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                THE SUN
              </div>
            </div>
          </div>
        </div>
        {health > 0 &&
          gameObjects
            .filter((obj) => obj.type !== "trash")
            .map((obj) => (
              <img
                key={obj.id}
                src={
                  obj.type === "cans"
                    ? cans
                    : obj.type === "bottles"
                    ? bottles
                    : obj.type === "potion"
                    ? potion
                    : obj.type === "fish"
                    ? fish
                    : ""
                }
                alt={obj.type}
                style={{
                  position: "absolute",
                  left: `${obj.x}px`,
                  top: `${obj.y}px`,
                  width: obj.size ? `${obj.size}px` : "60px",
                  height: obj.size ? `${obj.size}px` : "60px",
                  zIndex: 1000,
                }}
              />
            ))}
      </div>
    );
  }
  return (
    <div id="homescreen">
      <div className="clouds-container">
        {dynamicClouds.map((cloud) => (
          <img
            key={cloud.id}
            src={clouds}
            alt="cloud"
            className="cloud"
            style={{
              top: `${cloud.top}%`,
              left: `-${cloud.width}px`,
              width: `${cloud.width}px`,
              animationDuration: `${cloud.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="mountain-container">
        {mountains.map((m, i) => {
          const style = {
            position: "absolute",
            bottom: `-${m.height / 1.2}px`,
            left: m.left,
            width: `${m.width}px`,
            height: `${m.height}px`,
            background: `radial-gradient(circle at 50% 80%, #158b34 20%, #0f6f28 85%, #0b4d1e 100%)`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.4), inset 0 -20px 30px rgba(0,0,0,0.5)",
            borderRadius: "50% 50% 20% 20%",
            border: "8px solid rgba(0,0,0,0.5)",
            zIndex: m.isFront ? 2 : 1,
          };
          return <div key={i} style={style} />;
        })}
      </div>
      <div className="brick-wall" ref={brickWallRef}></div>
      <div className="sun">{rays}</div>
      <div className="fullscreen-icon">
        <div
          className="hitbox"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }}
        ></div>
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
          <button className="menu-button" onClick={() => setGameStarted(true)}>
            Start
          </button>
          <div className="lower-buttons">
            <button className="menu-button" onClick={() => setShowSettings(true)}>
              Settings
            </button>
            <button className="menu-button" onClick={() => setShowControlsInfo(true)}>
              Controls
            </button>
          </div>
        </div>
      </div>
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, fontFamily: "'Press Start 2P', cursive" }}>Settings</h3>
            <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
              <div style={{ width: "120px", textAlign: "right", marginRight: "10px" }}>
                Music: {musicVolume}
              </div>
              <input
                id="musicSlider"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                style={{ backgroundColor: "#333" }}
              />
            </div>
            <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
              <div style={{ width: "120px", textAlign: "right", marginRight: "10px" }}>
                SFX: {sfxVolume}
              </div>
              <input
                id="sfxSlider"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                style={{ backgroundColor: "#333" }}
              />
            </div>
            <button className="menu-button" onClick={() => setShowSettings(false)}>
              Close
            </button>
          </div>
        </div>
      )}
      {showControlsInfo && (
        <div className="settings-overlay" onClick={() => setShowControlsInfo(false)}>
          <div
            className="settings-modal keybinds-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: "18px",
              padding: "20px",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <h2 style={{ marginTop: 0, fontFamily: "'Press Start 2P', cursive", marginBottom: "15px", fontSize: "28px" }}>
              controls
            </h2>
            <p style={{ fontFamily: "'Press Start 2P', cursive", textAlign: "center", marginBottom: "20px", fontSize: "20px" }}>
              Press Esc to pause/resume
            </p>
            <div className="keybinds-content" style={{ fontSize: "20px", marginBottom: "20px" }}>
              <div style={{ marginBottom: "10px" }}>
                <strong>Player 1 Controls</strong>
                <ul style={{ margin: "5px 0 0 20px" }}>
                  <li>Up: W</li>
                  <li>Left: A</li>
                  <li>Down: S</li>
                  <li>Right: D</li>
                </ul>
              </div>
              <div>
                <strong>Player 2 Controls</strong>
                <ul style={{ margin: "5px 0 0 20px" }}>
                  <li>Up: ↑</li>
                  <li>Left: ←</li>
                  <li>Down: ↓</li>
                  <li>Right: →</li>
                </ul>
              </div>
            </div>
            <hr style={{ margin: "10px 0" }} />
            <div className="keybinds-content" style={{ fontSize: "20px", marginTop: "15px" }}>
              <div>
                <strong>Items & Their Effects</strong>
                <ul style={{ margin: "5px 0 0 20px" }}>
                  <li><strong>Cans</strong>: +10 points</li>
                  <li><strong>Bottles</strong>: +25 points</li>
                  <li>
                    <strong>Potion</strong>: Grants temporary invincibility (red text appears for Player 1 and stacks by 5 seconds)
                  </li>
                  <li><strong>Trash</strong>: -30 points and causes loss of 1 heart</li>
                  <li><strong>Fish</strong>: -15 points and causes loss of 1 heart</li>
                </ul>
              </div>
            </div>
            <button className="menu-button" onClick={() => setShowControlsInfo(false)} style={{ marginTop: "20px" }}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className="water">
        <svg viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d={d1} fill="#0af" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}
