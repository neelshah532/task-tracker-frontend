import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../store/Store";

const PublicRoute = () => {
  const user = useSelector((state: RootState) => state.user);

  return !user.token ? <Outlet /> : <Navigate to="/" />;
};

export default PublicRoute;
