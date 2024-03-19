import Home from "./pages/home/Home";
import Dictionary from "./pages/dictionary/Dictionary";
import User from "./pages/user/User";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import Login from "./pages/login/Login";
import Information from "./pages/information/Information";
import InformationDetails from "./pages/information/InformationDetails";
import Question from "./pages/question/Question";
import Quiz from "./pages/quiz/Quiz";
import Value from "./pages/value/Value";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import "./styles/global.scss";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(undefined || Boolean);
  const [username, setUsername] = useState("");
  const [userPriority, setUserPriority] = useState(undefined || Number);

  const handleLogout = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();

    Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoggedIn(false);
        setUsername("");
        Swal.fire(
          "Logged Out",
          "You have been successfully logged out",
          "success"
        );
      }
    });
  };

  const Layout = () => {
    return (
      <div className="main">
        <Navbar
          handleLogout={handleLogout}
          username={username}
          userPriority={userPriority}
        />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className="contentContainer">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const routes = [
    {
      path: "/",
      element: isLoggedIn ? <Layout /> : <Navigate to="/login" />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/dictionary",
          element: <Dictionary />,
        },
        {
          path: "/user",
          element: <User priority={userPriority} />,
        },
        {
          path: "/information",
          element: <Information />,
        },
        {
          path: "/information/:categoryId",
          element: <InformationDetails />,
        },
        {
          path: "/question",
          element: <Question />,
        },
        {
          path: "/quiz",
          element: <Quiz />,
        },
        {
          path: "/value",
          element: <Value />,
        },
      ],
    },
    {
      path: "/login",
      element: (
        <Login
          setIsLoggedIn={setIsLoggedIn}
          setUsername={setUsername}
          setUserPriority={setUserPriority}
        />
      ),
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={createBrowserRouter(routes)} />
    </DndProvider>
  );
}

export default App;
