import React, { useState, useEffect, useRef, useCallback } from "react";
import { initializeGameEngine } from "./gameEngine";
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
import plane from "./assets/plane.png";

export default function HomeScreen() {
  const [mountains, setMountains] = useState([]);
  const [dynamicClouds, setDynamicClouds] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showControlsInfo, setShowControlsInfo] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [openLargeSea, setOpenLargeSea] = useState(false);
  const [openGround, setOpenGround] = useState(false);
  const [openBlank, setOpenBlank] = useState(false);
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
  const [invincible1, setInvincible1] = useState(false);
  const [invincible2, setInvincible2] = useState(false);
  const [potionImmunity1, setPotionImmunity1] = useState(false);
  const [showPotionMsg1, setShowPotionMsg1] = useState(false);
  const [showPotionMsg2, setShowPotionMsg2] = useState(false);
  const [invincibilityTime1, setInvincibilityTime1] = useState(0);
  const [invincibilityTime2, setInvincibilityTime2] = useState(0);

  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const brickWallRef = useRef(null);
  const keys = useRef({});
  const removalScheduled1Ref = useRef(false);
  const removalScheduled2Ref = useRef(false);
  const invincibilityTimerRef1 = useRef(null);
  const invincibilityTimerRef2 = useRef(null);

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
  const groundSpawnPoint = {
    x: window.innerWidth / 2 - playerWidth / 2,
    y: 50,
  };

  const p1 = useRef({ pos: openGround ? { ...groundSpawnPoint } : { ...spawnPoint1 }, vel: { x: 0, y: 0 } });
  const p2 = useRef({ pos: openGround ? { ...groundSpawnPoint } : { ...spawnPoint2 }, vel: { x: 0, y: 0 } });
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  const potionCountRef = useRef(0);
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
          "--lineLength": `${rayLength}px`,
          animation: `bounce ${randomDuration}s linear infinite`,
          animationDelay: `${randomDelay}s`,
        }}
      />
    );
  });

  const handleSeaBoxClick = () => {
    setOpenLargeSea(true);
    setGameStarted(true);
    setOpenBlank(false);
  };

  const handleGroundBoxClick = () => {
    setOpenGround(true);
    setGameStarted(true);
    setGameOver(false);
    setHealth(3);
    setScore(0);
    setTimeLeft(60);
    potionCountRef.current = 0;
    p1.current = { pos: { ...groundSpawnPoint }, vel: { x: 0, y: 0 } };
    p2.current = { pos: { ...groundSpawnPoint }, vel: { x: 0, y: 0 } };
    setGameObjects([]);
    setOpenBlank(false);
  };

  const handleBlankLevelClick = () => {
    setOpenBlank(true);
    setGameStarted(true);
    setOpenLargeSea(false);
    setOpenGround(false);
  };

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

  const startPotionImmunity1 = () => {
    if (!potionImmunity1) {
      setPotionImmunity1(true);
      setInvincible1(true);
      setInvincibilityTime1(5);
      setShowPotionMsg1(true);
      setTimeout(() => setShowPotionMsg1(false), 1000);
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

  const startInvincibility2 = () => {
    if (!invincible2) {
      setInvincible2(true);
      setInvincibilityTime2(5);
      setShowPotionMsg2(true);
      setTimeout(() => setShowPotionMsg2(false), 1000);
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
    }
  };

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
      const h = isFront ? Math.floor(Math.random() * 150) + 2000 : Math.floor(Math.random() * 150) + 2650;
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
      if (e.key === "Escape" && gameStarted) {
        setPaused(prev => !prev);
      }
    };
    window.addEventListener("keydown", handlePause);
    return () => window.removeEventListener("keydown", handlePause);
  }, [gameStarted]);

  useEffect(() => {
    const handleBlur = () => setPaused(true);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  useEffect(() => {
    if (!gameStarted || !openLargeSea || paused) return;
    const types = ["cans", "bottles", "potion", "trash"];
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
      const randomDelay = Math.random() * 8000;
      const x = Math.random() * (window.innerWidth - 50);
      const y = -50;
      const vx = 0;
      const vy = 1 + Math.random();
      const size = 60;
      const phase = Math.random() * Math.PI * 2;
      const newObj = { id: Date.now() + Math.random(), type, x, y, vx, vy, size, phase, randomDelay };
      setGameObjects(prev => [...prev, newObj]);
    }, 500);
    return () => clearInterval(spawnInterval);
  }, [gameStarted, openLargeSea, paused]);

  useEffect(() => {
    if (!gameStarted || !openGround || paused || gameOver) return;
    const engine = initializeGameEngine({
      setGameObjects,
      timeLeftRef,
      potionCountRef,
      setScore,
      setHealth,
      p1,
      p2,
      playerWidth,
      playerHeight,
      setGameOver,
      spawnIntervalTime: 500,
      startPotionImmunity1,
      startInvincibility2
    });
    return () => engine.stop();
  }, [gameStarted, openGround, paused, gameOver]);

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
          .map(obj => ({ ...obj, y: obj.y + obj.vy }))
          .filter(obj => obj.x + (obj.size || 60) > 0 && obj.x < window.innerWidth)
      );
      frameId = requestAnimationFrame(updateObjects);
    };
    frameId = requestAnimationFrame(updateObjects);
    return () => cancelAnimationFrame(frameId);
  }, [openLargeSea, paused]);

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
              if ((collisionP1 || collisionP2) && !obj.hit) {
                setScore(s => s - 30);
                setHealth(h => {
                  const newH = h - 1;
                  if (newH <= 0) setGameOver(true);
                  return newH;
                });
                obj.hit = true;
              }
            } else if (obj.type === "potion") {
              if (collisionP1) {
                startPotionImmunity1();
              }
              if (collisionP2) {
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
    if (!openGround) return;
    let groundFrameId;
    const GRAVITY = 0.1;
    const brickWallHeight = window.innerHeight * 0.2;
    const groundLoop = () => {
      if (paused) {
        groundFrameId = requestAnimationFrame(groundLoop);
        return;
      }
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
      const floorY = window.innerHeight - brickWallHeight - playerHeight + 7;
      if (p1.current.pos.y > floorY) {
        p1.current.pos.y = floorY;
        p1.current.vel.y = 0;
      }
      if (p2.current.pos.y > floorY) {
        p2.current.pos.y = floorY;
        p2.current.vel.y = 0;
      }
      if (p1.current.pos.x < 0 || p1.current.pos.x > window.innerWidth - playerWidth) {
        setHealth(h => {
          const newH = h - 1;
          if (newH <= 0) setGameOver(true);
          return newH;
        });
        p1.current.pos = { ...groundSpawnPoint };
        p1.current.vel = { x: 0, y: 0 };
        setStunned1(true);
        setTimeout(() => setStunned1(false), 3000);
      }
      if (p2.current.pos.x < 0 || p2.current.pos.x > window.innerWidth - playerWidth) {
        setHealth(h => {
          const newH = h - 1;
          if (newH <= 0) setGameOver(true);
          return newH;
        });
        p2.current.pos = { ...groundSpawnPoint };
        p2.current.vel = { x: 0, y: 0 };
        setStunned2(true);
        setTimeout(() => setStunned2(false), 3000);
      }
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
      groundFrameId = requestAnimationFrame(groundLoop);
    };
    groundFrameId = requestAnimationFrame(groundLoop);
    return () => cancelAnimationFrame(groundFrameId);
  }, [openGround, playerScale, stunned1, stunned2, paused, checkRemovalForP1, checkRemovalForP2]);

  useEffect(() => {
    if (gameStarted) {
      setScore(0);
      setTimeLeft(60);
      setHealth(3);
    }
  }, [gameStarted]);

  useEffect(() => {
    if ((openLargeSea || openGround) && !gameOver && !paused) {
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
  }, [openLargeSea, openGround, gameOver, paused]);

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

  if (gameStarted) {
    if (openLargeSea) {
      if (gameOver) {
        if (score >= 250) {
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
              <h1 style={{ color: "green" }}>LEVEL PASSED</h1>
              <h2>Score: {score}</h2>
              <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
                <button className="menu-button" onClick={() => {
                  setGameOver(false);
                  setHealth(3);
                  setScore(0);
                  setTimeLeft(60);
                  p1.current.pos = { ...spawnPoint1 };
                  p2.current.pos = { ...spawnPoint2 };
                  setOpenLargeSea(true);
                }}>
                  Retry
                </button>
                <button className="menu-button" onClick={closeLargeSea}>
                  Home
                </button>
              </div>
            </div>
          );
        } else {
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
              <h2>SCORE: {score} - LOST ALL LIVES</h2>
              <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
                <button className="menu-button" onClick={() => {
                  setGameOver(false);
                  setHealth(3);
                  setScore(0);
                  setTimeLeft(60);
                  p1.current.pos = { ...spawnPoint1 };
                  p2.current.pos = { ...spawnPoint2 };
                  setOpenLargeSea(true);
                }}>
                  Retry
                </button>
                <button className="menu-button" onClick={() => {
                  setOpenLargeSea(false);
                  setGameStarted(false);
                }}>
                  Home
                </button>
              </div>
            </div>
          );
        }
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
          {showPotionMsg1 && (
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
              Player One got immunity for 5 seconds
            </div>
          )}
          {showPotionMsg2 && (
            <div
              style={{
                position: "absolute",
                top: 60,
                left: "70%",
                transform: "translateX(-50%)",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "20px",
                color: "blue",
              }}
            >
              Player Two got immunity for 5 seconds
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
          <button className="menu-button" onClick={() => {
            setOpenLargeSea(false);
            setGameStarted(false);
          }}
          style={{ position: "absolute", top: "10px", left: "10px", zIndex: 100 }}>
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
    if (gameStarted && openGround) {
      if (gameOver) {
        if (score >= 250) {
          return (
            <div
              id="ground-game"
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
              <h1 style={{ color: "green" }}>LEVEL PASSED</h1>
              <h2>Score: {score}</h2>
              <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
                <button className="menu-button" onClick={() => {
                  setGameOver(false);
                  setHealth(3);
                  setScore(0);
                  setTimeLeft(60);
                  p1.current.pos = { ...spawnPoint1 };
                  p2.current.pos = { ...spawnPoint2 };
                  setOpenGround(true);
                }}>
                  Retry
                </button>
                <button className="menu-button" onClick={() => {
                  setOpenGround(false);
                  setGameStarted(false);
                }}>
                  Home
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div
              id="ground-game"
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
              <h2>SCORE: {score} - LOST ALL LIVES</h2>
              <div style={{ display: "flex", gap: "30px", marginTop: "30px" }}>
                <button className="menu-button" onClick={() => {
                  setGameOver(false);
                  setHealth(3);
                  setScore(0);
                  setTimeLeft(60);
                  p1.current.pos = { ...spawnPoint1 };
                  p2.current.pos = { ...spawnPoint2 };
                  setOpenGround(true);
                }}>
                  Retry
                </button>
                <button className="menu-button" onClick={() => {
                  setOpenGround(false);
                  setGameStarted(false);
                }}>
                  Home
                </button>
              </div>
            </div>
          );
        }
      }
      return (
        <div
          id="ground-game"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            background: "#d0e7f9",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "24px",
              color: "#000",
              zIndex: 101,
            }}
          >
            Score: {score} | Time: {timeLeft}s
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              display: "flex",
              gap: "5px",
              zIndex: 102,
            }}
          >
            {Array.from({ length: health }).map((_, i) => (
              <img key={`heart-${i}`} src={heart} alt="heart" style={{ width: "30px", height: "30px" }} />
            ))}
          </div>
          <div className="brick-wall" ref={brickWallRef}></div>
          <img
            ref={player1Ref}
            src={player1Img}
            alt="Player 1"
            className="player player1"
            style={{
              width: `${playerWidth}px`,
              height: `${playerHeight}px`,
              zIndex: 110,
              position: "absolute",
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
              zIndex: 110,
              position: "absolute",
            }}
          />
          {gameObjects.map(obj => (
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
                setOpenGround(false);
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
    if (gameStarted && openBlank) {
      return (
        <div
          id="blank-level"
          style={{
            width: "100vw",
            height: "100vh",
            background: "#fff"
          }}
        />
      );
    }
    return (
      <div className="game-start-screen" style={{ background: "rgba(0,0,0,0.5)" }}>
        <button className="menu-button" onClick={() => setGameStarted(false)}>
          Close
        </button>
        <div className="levels-container">
          <div className="level-box ground-box" onClick={handleGroundBoxClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                EARTH
              </div>
            </div>
          </div>
          <div className="level-box mountain-box" onClick={handleBlankLevelClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                MOUNTAINS
              </div>
            </div>
          </div>
          <div className="level-box sea-box" onClick={handleSeaBoxClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                OCEAN
              </div>
            </div>
          </div>
          <div className="level-box sky-box" onClick={handleBlankLevelClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                SKY
              </div>
            </div>
          </div>
          <div className="level-box sun-box" onClick={handleBlankLevelClick}>
            <div className="title-container">
              <div className="cover-text" style={{ fontSize: "20px" }}>
                SPACE
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
                    <strong>Potion</strong>: Grants temporary invincibility (red text for Player 1, blue text for Player 2)
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