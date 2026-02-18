import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useState(localStorage.getItem("loggediInUser"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggediInUser");
    handleSuccess("User LoggedOut Successfully!");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div>
      HOME PAGE
      <h1>User Name: {loggedInUser}</h1>

      <button onClick={handleLogout}>Logout</button>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Home;
