import { Provider } from "react-redux";
import { store } from "./store.js";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
});

createRoot(document.getElementById("root")).render(

  <Provider store={store}>
    <App />
  </Provider>
);
