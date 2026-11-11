import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import RoomDetail from "./pages/RoomDetail";
import CreateRoom from "./pages/CreateRoom";
import EditRoom from "./pages/EditRoom";
import RequireAuth from "./components/RequireAuth";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";



function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        {/* create */}
        <Route
          path="/create-room"
          element={
            <RequireAuth>
              <CreateRoom />
            </RequireAuth>
          }
        />
        {/* update */}
        <Route
          path="/room/:id/edit"
          element={
            <RequireAuth>
              <EditRoom />
            </RequireAuth>
          }
        />
        <Route path="/profile/:id" element={<Profile />} />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
