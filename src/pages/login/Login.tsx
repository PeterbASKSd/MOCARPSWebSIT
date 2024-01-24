import "./login.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import faEye and faEyeSlash icons
import EmailIcon from "../../assets/email.svg";
import PasswordIcon from "../../assets/password.svg";
import { UserType } from "../../data";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn, setUsername }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getUsername = async () => {
    try {
      const response = await fetch(
        `https://mocarps.azurewebsites.net/user/?email=${email}`
      );
      if (response.ok) {
        const users: UserType[] = await response.json();
        console.log("Users:", users); // Check the users array in the console

        const user = users.find(
          (user: UserType) => user.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          console.log("User found:", user.name);
          setUsername(user.name);
        } else {
          console.log("User not found");
        }
      } else {
        // Handle error response
        console.error("Failed to fetch username");
      }
    } catch (error) {
      // Handle network or fetch error
      console.error("Error fetching username:", error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Perform login validation here
    // Example: Check if email and password are valid

    // If login is successful, set isLoggedIn to true and redirect to Home
    setIsLoggedIn(true);
    getUsername();
    navigate("/");
  };

  return (
    <div className="login">
      <div className="login-main">
        <label className="title">Welcome Back</label>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-group-title">
              <img src={EmailIcon} />
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-group-title">
              <img src={PasswordIcon} />
              Password:
            </label>
            <input
              className="password-input-wrapper"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              onClick={handleTogglePassword}
              className="password-toggle-icon"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
