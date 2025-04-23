import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import Billboard from './components/Billboard/Billboard';
import Forum from './components/Forum/Forum';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Billboard />
        <Forum />
        {/* Other components */}
      </div>
    </Router>
  );
}

export default App;