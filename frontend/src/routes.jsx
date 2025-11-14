import Landing from "./pages/Landing";
import Overlay from "./pages/Overlay";
import Home from "./pages/Home";
import Simulator from "./pages/Simulator";
import Profile from "./pages/Profile";
import Loans from "./pages/Loans";
import Wrapper from "./pages/Wrapper";
import AddExpense from "./pages/AddExpense";
import QRAnimation from "./pages/QRAnimation";
import TrxnFinish from "./components/TrxnFinish";
import TrxnDetail from "./pages/TrxnDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute"; // <-- add this

const routes = [
  {
    path: "/",
    element: <Landing />,
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <Wrapper />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Overlay />,
        children: [
          { path: "home", element: <Home /> },
          { path: "simulator", element: <Simulator /> },
          { path: "loans", element: <Loans /> },
          { path: "profile", element: <Profile /> },
        ],
      },
      { path: "new_transaction", element: <AddExpense /> },
      { path: "QRScan", element: <QRAnimation /> },
      { path: "trxn_success", element: <TrxnFinish /> },
      { path: "trxn_details", element: <TrxnDetail /> },
    ],
  },
];

export default routes;
