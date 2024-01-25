import "./navbar.scss";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import UserIcon from "../../assets/user.svg";
import LogoutIcon from "../../assets/logout.svg";

interface NavbarProps {
  handleLogout: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => void;
  username: string;
}

const Navbar: React.FC<NavbarProps> = ({ handleLogout, username }) => {
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
          <Link to="/login" onClick={handleLogout as any}>
            <img src={LogoutIcon} alt="" title="Logout" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
