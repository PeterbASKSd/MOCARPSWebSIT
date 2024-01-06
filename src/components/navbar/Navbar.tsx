import "./navbar.scss";

import Logo from "../../assets/logo.svg";
import UserIcon from "../../assets/user.svg";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="logo">
        <img src={Logo} alt="" />
        <span>MOCARPS CMS</span>
      </div>
      <div className="icon">
        <div className="userLogo">
          <img src={UserIcon} alt="" />
          <span>Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
