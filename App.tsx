

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MatchLogger } from './pages/MatchLogger';
import { History } from './pages/History';
import { TournamentHub } from './pages/Tournament';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MatchLogger />} />
        <Route path="/history" element={<History />} />
        <Route path="/tournament" element={<TournamentHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
