

import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { MatchLogger } from './pages/MatchLogger';
import { History } from './pages/History';
import { TournamentHub } from './pages/Tournament';

const router = createHashRouter([
  {
    path: "/",
    element: <MatchLogger />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "/tournament",
    element: <TournamentHub />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
