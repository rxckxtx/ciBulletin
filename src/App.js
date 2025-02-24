import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Billboard from './components/Billboard/Billboard';
import Forum from './components/Forum/Forum';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          {/* Add navigation links here */}
        </nav>
        <Routes>
          <Route path="/" element={<Billboard />} />
          <Route path="/forum" element={<Forum />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;