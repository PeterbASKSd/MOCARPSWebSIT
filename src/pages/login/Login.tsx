import "./login.scss";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import faEye and faEyeSlash icons
import EmailIcon from "../../assets/email.svg";
import PasswordIcon from "../../assets/password.svg";
import { UserType } from "../../data";
import Swal from "sweetalert2";
import Logo from "../../assets/logo.svg";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ setIsLoggedIn, setUsername }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  let findUsername: boolean = false;
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

        const user = users.find(
          (user: UserType) => user.email.toLowerCase() === email.toLowerCase()
        );
        if (user) {
          findUsername = true;
          setUsername(user.name);
          handleLoginLogic();
        } else {
          Swal.fire(
            "Failed to login",
            "Please check your email and password",
            "error"
          );
        }
      } else {
        console.error("Failed to fetch username");
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const handleLoginLogic = () => {
    if (findUsername === true) {
      setIsLoggedIn(true);
      Swal.fire("Successful to login", "Welcome back", "success");
    } else {
      setIsLoggedIn(false);
    }
    navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    await getUsername();
  };

  return (
    <div className="login">
      <div className="login-main">
        <label className="title">
          <img src={Logo} alt="" className="webLogo" />
          MOCARPS CMS
        </label>
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
