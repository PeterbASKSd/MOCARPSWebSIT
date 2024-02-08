import "./login.scss";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import faEye and faEyeSlash icons
import EmailIcon from "../../assets/email.svg";
import PasswordIcon from "../../assets/password.svg";
import Swal from "sweetalert2";
import Logo from "../../assets/logo.svg";

interface LoginProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUsername: (username: string) => void;
  setUserPriority: (priority: number) => void;
}

const Login: React.FC<LoginProps> = ({
  setIsLoggedIn,
  setUsername,
  setUserPriority,
}) => {
  const [loginForm, setLoginForm] = useState({
    email: undefined || "",
    password: undefined || "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (email && password) {
      setLoginForm({ email, password });
    }
  }, [email, password]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("loginForm:(1)", loginForm);

    try {
      const response = await fetch(
        "https://mocarps.azurewebsites.net/user/portal/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginForm),
        }
      );

      if (response.ok) {
        const responseData = await response.json(); // Parse the response data
        setUsername(responseData.name); // Access the name property from the response data
        setUserPriority(responseData.priority); // Access the priority property from the response data
        console.log(
          "response:(2) ok",
          responseData.name,
          " ",
          responseData.priority
        );
        setIsLoggedIn(true);
        Swal.fire("Successful to login", "Welcome back", "success");
        navigate("/");
      } else if (response.status === 401) {
        setIsLoggedIn(false);
        Swal.fire(
          "Unauthorized",
          "Please check your email and password",
          "error"
        );
      } else {
        setIsLoggedIn(false);
        console.error("Error logging in:", Error);
      }
    } catch (error) {
      setIsLoggedIn(false);
      console.error("Error logging in:", error);
    }
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
