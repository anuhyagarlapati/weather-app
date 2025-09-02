import React from 'react';
import WeatherApp from './components/WeatherApp';


function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url(/weather.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <WeatherApp />
    </div>
  );
}


export default App;
