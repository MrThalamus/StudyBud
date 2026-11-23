import { Outlet } from "react-router-dom";
import AdminNav from "../../components/admin/AdminNav";
import "./AdminPage.css";

// Sidebar on the left, the current admin page on the right
export default function AdminLayout() {
  return (
    <div className="container admin-layout">
      <AdminNav />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
