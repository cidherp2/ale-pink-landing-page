import { Navigate, Outlet } from "react-router-dom";

const AuthGuard = ({ authenticated, loading }: { authenticated: boolean; loading: boolean }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;
