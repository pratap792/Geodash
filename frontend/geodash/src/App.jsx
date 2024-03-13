/* eslint-disable no-unused-vars */
// App.js
import React from 'react';
import Req from './Req';
function App() {
  return (
    <div id="main">
      <nav>
        <img id="logo" src="../public/logo_aha.png" alt="" />
        <h1 id="title">GeoDash</h1>
      </nav>

      <Req />
      <div id="data">
        <h2>Data</h2>
      </div>
    </div>
  );
}

export default App;
