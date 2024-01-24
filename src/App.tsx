import Home from "./pages/home/Home";
import Dictionary from "./pages/dictionary/Dictionary";
import User from "./pages/user/User";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import Login from "./pages/login/Login";
import Information from "./pages/information/Information";
import Question from "./pages/question/Question";
import Quiz from "./pages/quiz/Quiz";
import Value from "./pages/value/Value";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import "./styles/global.scss";

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
  };

  const Layout = () => {
    return (
      <div className="main">
        <Navbar handleLogout={handleLogout} username={username} />
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
          element: <User />,
        },
        {
          path: "/information",
          element: <Information />,
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
        <Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
      ),
    },
  ];

  return <RouterProvider router={createBrowserRouter(routes)} />;
}

export default App;
