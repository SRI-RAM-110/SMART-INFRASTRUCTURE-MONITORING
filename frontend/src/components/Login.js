import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        empId,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch {
      alert("Invalid login");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-box">
        <h2>Login</h2>
        <input placeholder="Emp ID" onChange={(e) => setEmpId(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
        <p className="register-link">
  New user? <Link to="/register">Register</Link>
</p>
      </form>

    </div>
  );
}

export default Login;