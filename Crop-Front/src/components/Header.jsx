import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="p-4 bg-gray-200 flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/Login">Login</Link>
      <Link to="/Dashboard">Dashboard</Link>

    </header>
  );
}
