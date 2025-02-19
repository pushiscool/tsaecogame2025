import React, { useState, useEffect } from 'react';  
import './HomeScreen.css';  
  
export default function HomeScreen() {  
  const [mountains, setMountains] = useState([]);  
  const [isGameRunning, setIsGameRunning] = useState(false);  
  const [clouds, setClouds] = useState([]);  
  
  const messages = [  
    "Stay Secure!",  
    "Encrypt Data!",  
    "Update Software!",  
    "Strong Passwords!",  
    "Beware of Phishing!",  
    "Backup Regularly!",  
    "Enable 2FA!",  
    "Monitor Networks!",  
    "Secure Devices!"  
  ];  
  
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
    setIsGameRunning(true);  
    setClouds([]); // Reset clouds  
  }  
  
  useEffect(() => {  
    if (!isGameRunning) return;  
  
    const cloudInterval = setInterval(() => {  
      const message = messages[Math.floor(Math.random() * messages.length)];  
      setClouds(clouds => [  
        ...clouds,  
        { id: clouds.length, top: `${Math.random() * 30 + 10}%`, message }  
      ]);  
    }, 3000); // Adjust interval to change cloud appearance rate  
  
    return () => clearInterval(cloudInterval); // Cleanup on component unmount or when game stops  
  }, [isGameRunning]);  
  
  return (  
    <div id="homescreen">  
      <h1 className="game-title">Cloud Counter Game</h1>  
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
  
      {/* Display cloud count */}  
      {isGameRunning && (  
        <div className="cloud-counter">  
          Clouds Counted: {clouds.length}  
        </div>  
      )}  
  
      {/* Render clouds with messages */}  
      {isGameRunning && clouds.map(cloud => (  
        <div  
          key={cloud.id}  
          className="cloud"  
          style={{  
            position: 'absolute',  
            top: cloud.top,  
            left: `${cloud.id * 10}%`,  
            width: '150px',  
            height: '80px',  
            backgroundColor: 'white',  
            borderRadius: '50%',  
            textAlign: 'center',  
            lineHeight: '80px',  
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',  
          }}  
        >  
          {cloud.message}  
        </div>  
      ))}  
    </div>  
  );  
}  
