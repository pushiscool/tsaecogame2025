import React, { useState, useEffect } from 'react';  
import './HomeScreen.css';  
  
export default function HomeScreen() {  
  const [mountains, setMountains] = useState([]);  
  
  useEffect(() => {  
    let leftPos = 0;  
    const arr = [];  
    while (leftPos < 300) {  
      const isFront = arr.length % 2 === 0;  
      const h = isFront  
        ? Math.floor(Math.random() * 150) + 1400  
        : Math.floor(Math.random() * 150) + 2100;  
      const w = Math.floor(Math.random() * 200) + 1450;  
      const s = Math.random() * 2;  
      const l = leftPos + s;  
      arr.push({ height: h, width: w, left: `${l}%`, isFront });  
      leftPos = l + 9.5;  
    }  
    setMountains(arr);  
  }, []);  
  
 function startGame() {  
  console.log("Button Clicked");  
  alert("Game Started");  
}  
  
 return (  
    <div id="homescreen">  
      <h1 className="game-title">Epic Mountain Adventure</h1>  
      <button onClick={startGame} className="start-button">Start Game</button>  
      <div className="mountain-container">  
        {mountains.map((m, i) => {  
          const style = {  
            position: "absolute",  
            bottom: `-${m.height / 1.2}px`,  
            left: m.left,  
            width: `${m.width}px`,  
            height: `${m.height}px`,  
            background: `  
              radial-gradient(  
                circle at 50% 80%,  
                #2e8b57 20%,  /* SeaGreen */  
                #228b22 60%,  /* ForestGreen */  
                #006400 100%  /* DarkGreen */  
              )  
            `,  
            boxShadow: `  
              0 20px 50px rgba(0, 0, 0, 0.4),  
              inset 0 -20px 30px rgba(0, 0, 0, 0.5)  
            `,  
            borderRadius: "50% 50% 20% 20%",  
            border: "5px solid rgba(0, 0, 0, 0.5)",  
            zIndex: m.isFront ? 2 : -1,  
          };  
          return <div key={i} style={style} />;  
        })}  
      </div>  
      <div className="sun" />  
      {/* Add cloud elements */}  
      <div className="cloud" style={{ top: '10%', animationDelay: '0s' }} />  
      <div className="cloud" style={{ top: '15%', animationDelay: '15s' }} />  
      <div className="cloud" style={{ top: '20%', animationDelay: '30s' }} />  
    </div>  
  );  
}  
