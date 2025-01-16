import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./store/Store.ts";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Toaster richColors position="top-center" />
    <Provider store={store}>
      <App />
    </Provider>
    ,
  </BrowserRouter>
);
