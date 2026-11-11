import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import RoomDetail from "./pages/RoomDetail";
import CreateRoom from "./pages/CreateRoom";
import RequireAuth from "./components/RequireAuth";




function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route
          path="/create-room"
          element={
            <RequireAuth>
              <CreateRoom />
            </RequireAuth>
          }
        />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </>
  );
}

export default App;
