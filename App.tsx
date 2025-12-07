import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchLogger } from './pages/MatchLogger';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MatchLogger />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;