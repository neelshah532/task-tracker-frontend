import { Route, Routes } from "react-router-dom";
import Auth from "../module/Auth/Auth";
import Dashboard from "../module/Dashboard/Dashboard";
import PublicRoute from "./PubliceRoutes";
import ProtectedRoutes from "./PrivateRoutes";

const Approutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Auth />} />
      </Route>
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
};

export default Approutes;
