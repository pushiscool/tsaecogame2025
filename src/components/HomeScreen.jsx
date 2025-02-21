import React, { useState } from 'react';  
import './HomeScreen.css';  
import player1Img from './assets/player1.png';  
import player2Img from './assets/player2.png';  
  
export default function HomeScreen() {  
  const [openLevel, setOpenLevel] = useState(null);  
  
  const handleLevelClick = (level) => {  
    setOpenLevel(level);  
  };  
  
  const closeLevel = () => {  
    setOpenLevel(null);  
  };  
  
  const renderLevelContent = () => {  
    switch (openLevel) {  
      case 'ground':  
        return <div className="ground-content">Welcome to the Ground Level!</div>;  
      case 'mountain':  
        return <div className="mountain-content">Explore the Mountain Level!</div>;  
      case 'sea':  
        return <div className="sea-content">Dive into the Sea Level!</div>;  
      case 'sky':  
        return <div className="sky-content">Fly through the Sky Level!</div>;  
      case 'horizon':  
        return <div className="horizon-content">Enjoy the Horizon Level!</div>;  
      default:  
        return null;  
    }  
  };  
  
  return (  
    <div id="homescreen">  
      {!openLevel && (  
        <div className="levels-container">  
          <div className="level ground" onClick={() => handleLevelClick('ground')}>Ground</div>  
          <div className="level mountain" onClick={() => handleLevelClick('mountain')}>Mountain</div>  
          <div className="level sea" onClick={() => handleLevelClick('sea')}>Sea</div>  
          <div className="level sky" onClick={() => handleLevelClick('sky')}>Sky</div>  
          <div className="level horizon" onClick={() => handleLevelClick('horizon')}>Horizon</div>  
        </div>  
      )}  
      {openLevel && (  
        <div className="level-content">  
          <button onClick={closeLevel}>Close</button>  
          {renderLevelContent()}  
        </div>  
      )}  
    </div>  
  );  
}  
