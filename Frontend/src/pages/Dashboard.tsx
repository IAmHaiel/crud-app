import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { username } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {username}!</h1>
      <p>Manage your products using the navigation above.</p>
      <Link to="/products" className="btn">View Products</Link>
    </div>
  );
}
