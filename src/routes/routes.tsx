import { Route, Routes } from "react-router-dom";
import Auth from "../module/Auth/Auth";

const Approutes = () => {
  return (
    <Routes>
      {/* <Route path="*" element={<Navigate to="/auth" />} /> */}
      <Route path="/login" element={<Auth />} />
    </Routes>
  );
};

export default Approutes;
