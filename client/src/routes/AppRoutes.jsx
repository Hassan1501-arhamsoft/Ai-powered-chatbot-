import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "../features/chat/pages/Chat";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register"; 
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/register" element={<Register />} /> 
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;