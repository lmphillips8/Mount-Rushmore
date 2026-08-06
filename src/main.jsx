import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import History from "./pages/History.jsx";
import { UserProvider } from "./context/UserContext.jsx";
import "./index.css";
import Suggest from "./pages/Suggest.jsx";
import Admin from "./pages/Admin.jsx";
import Layout from "./components/Layout.jsx";
import Community from "./pages/Community.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/Community" element={<Community />} />
            <Route path="/suggest" element={<Suggest />} />
            <Route path="/History" element={<History />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>,
);
