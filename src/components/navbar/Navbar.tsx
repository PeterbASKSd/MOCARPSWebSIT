import "./navbar.scss";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import UserIcon from "../../assets/user.svg";
import LogoutIcon from "../../assets/logout.svg";

const Navbar = ({
  handleLogout,
  username,
}: {
  handleLogout: () => void;
  username: string;
}) => {
  return (
    <div className="navbar">
      <div className="logo">
        <img src={Logo} alt="" />
        <span>MOCARPS CMS</span>
      </div>
      <div className="icon">
        <div className="userLogo">
          <img src={UserIcon} alt="" />
          <span>{username}</span>
          <Link to="/login" onClick={handleLogout}>
            <img src={LogoutIcon} alt="" title="Logout" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
