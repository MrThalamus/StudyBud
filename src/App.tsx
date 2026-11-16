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
import RequireAdmin from "./components/RequireAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminTopics from "./pages/admin/AdminTopics";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLayout from "./pages/admin/AdminLayout";


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

        {/* Edit profile */}
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <EditProfile />
            </RequireAuth>
          }
        />

        {/* Admin (superusers only) */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="topics" element={<AdminTopics />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
