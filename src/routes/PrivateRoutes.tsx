import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../store/Store";
// import { userData } from '../assets/userData';

const ProtectedRoutes = () => {
  const user = useSelector((state: RootState) => state.user);

  return user.token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
