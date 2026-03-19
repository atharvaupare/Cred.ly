import Landing from "./pages/Landing";
import Overlay from "./pages/Overlay";
import Home from "./pages/Home";
import Simulator from "./pages/Simulator";
import Profile from "./pages/Profile";
import Loans from "./pages/Loans";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ScenarioHistory from "./pages/ScenarioHistory";
import ScenarioDetail from "./pages/ScenarioDetail";
import TargetScoreAdvisor from "./pages/TargetScoreAdvisor";

import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Overlay />
      </ProtectedRoute>
    ),
    children: [
      { path: "home", element: <Home /> },
      { path: "simulator", element: <Simulator /> },
      { path: "loans", element: <Loans /> },
      { path: "profile", element: <Profile /> },
      { path: "scenarios", element: <ScenarioHistory /> },
      { path: "scenario/:id", element: <ScenarioDetail /> },
      { path: "target-score", element: <TargetScoreAdvisor /> },
    ],
  },
];

export default routes;
