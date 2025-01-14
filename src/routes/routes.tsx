import { Route, Routes } from "react-router-dom";
import Auth from "../module/Auth/auth";

const Approutes = () => {
  return (
    <Routes>
      {/* <Route path="*" element={<Navigate to="/auth" />} /> */}
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
};

export default Approutes;
