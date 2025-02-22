export function initializeGameEngine(config) {
  const {
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
    spawnIntervalTime = 500
  } = config;
  function spawnObject() {
    const types = ["cans", "bottles", "potion", "trash"];
    let type = types[Math.floor(Math.random() * types.length)];
    if (type === "potion") {
      if (potionCountRef.current >= 3) {
        type = types[Math.floor(Math.random() * types.length)];
        if (type === "potion") return;
      } else {
        potionCountRef.current++;
      }
    }
    let x, y, vx, vy, size = 60, phase = Math.random() * Math.PI * 2, ax = 0;
    x = Math.random() * (window.innerWidth - 50);
    y = -50;
    vx = Math.random() < 0.5 ? 1 : -1;
    vy = 1 + Math.random() * 2;
    if (x < 100) {
      ax = 0.05;
    } else if (x > window.innerWidth - 100) {
      ax = -0.05;
    }
    const newObj = { id: Date.now() + Math.random(), type, x, y, vx, vy, ax, size, phase };
    setGameObjects(prev => [...prev, newObj]);
    if (timeLeftRef.current <= 20) {
      const extraTypes = ["cans", "bottles", "potion", "trash"];
      let extraType1 = extraTypes[Math.floor(Math.random() * extraTypes.length)];
      let extraType2 = extraTypes[Math.floor(Math.random() * extraTypes.length)];
      if (extraType1 === "potion" && potionCountRef.current >= 3) extraType1 = "cans";
      if (extraType2 === "potion" && potionCountRef.current >= 3) extraType2 = "cans";
      const leftObj = {
        id: Date.now() + Math.random(),
        type: extraType1,
        x: -50,
        y: Math.random() * 200,
        vy: 1 + Math.random() * 2,
        vx: 2,
        ax: 0.05,
        size: 60,
        phase: Math.random() * Math.PI * 2
      };
      const rightObj = {
        id: Date.now() + Math.random(),
        type: extraType2,
        x: window.innerWidth + 50,
        y: Math.random() * 200,
        vy: 1 + Math.random() * 2,
        vx: -2,
        ax: -0.05,
        size: 60,
        phase: Math.random() * Math.PI * 2
      };
      setGameObjects(prev => [...prev, leftObj, rightObj]);
    }
  }
  const spawnIntervalId = setInterval(spawnObject, spawnIntervalTime);
  function updateObjects() {
    const difficulty = 1 + ((60 - timeLeftRef.current) / 30);
    const verticalMultiplier = 1 + ((60 - timeLeftRef.current) / 60);
    const maxSpeed = 3;
    setGameObjects(prev =>
      prev
        .map(obj => {
          const baseUpdatedVx = obj.vx + (obj.ax || 0);
          let updatedVx;
          if (obj.vx < 0) {
            updatedVx = baseUpdatedVx > 0 ? 0 : Math.max(baseUpdatedVx, -maxSpeed);
          } else if (obj.vx > 0) {
            updatedVx = baseUpdatedVx < 0 ? 0 : Math.min(baseUpdatedVx, maxSpeed);
          } else {
            updatedVx = baseUpdatedVx;
          }
          return {
            ...obj,
            vx: updatedVx,
            x: obj.x + updatedVx * difficulty,
            y: obj.y + obj.vy * verticalMultiplier
          };
        })
        .filter(obj => obj.x + (obj.size || 60) > 0 && obj.x < window.innerWidth + 50)
    );
    requestAnimationFrame(updateObjects);
  }
  updateObjects();
  function checkCollisions() {
    setGameObjects(prev => {
      const processed = new Set();
      const remaining = [];
      prev.forEach(obj => {
        if (processed.has(obj.id)) return;
        const objSize = obj.size || 60;
        const collides = player =>
          player.current.pos.x < obj.x + objSize &&
          player.current.pos.x + playerWidth > obj.x &&
          player.current.pos.y < obj.y + objSize &&
          player.current.pos.y + playerHeight > obj.y;
        const p1Collision = collides(p1);
        const p2Collision = collides(p2);
        if (p1Collision || p2Collision) {
          processed.add(obj.id);
          if (obj.type === "cans") {
            if (p1Collision) setScore(s => s + 10);
            if (p2Collision) setScore(s => s + 10);
          } else if (obj.type === "bottles") {
            if (p1Collision) setScore(s => s + 25);
            if (p2Collision) setScore(s => s + 25);
          } else if (obj.type === "trash") {
            if ((p1Collision || p2Collision) && !obj.hit) {
              setScore(s => s - 30);
              setHealth(h => {
                const newH = h - 1;
                if (newH <= 0) setGameOver(true);
                return newH;
              });
              obj.hit = true;
            }
          } else if (obj.type === "potion") {
            if (p1Collision && config.startPotionImmunity1) config.startPotionImmunity1();
            if (p2Collision && config.startInvincibility2) config.startInvincibility2();
          }
        } else {
          remaining.push(obj);
        }
      });
      return remaining;
    });
    setTimeout(checkCollisions, 100);
  }
  checkCollisions();
  return {
    stop: () => clearInterval(spawnIntervalId)
  };
}