import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { ToastContainer } from "react-toastify";

const Home = () => {
  const navigate = useNavigate();
  const [loggedInUser] = useState(localStorage.getItem("loggediInUser"));
  const [products, setProducts] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = "http://localhost:8080/products/prods";
        const headers = {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        };
        const response = await fetch(url, headers);
        const result = await response.json();
        console.log(result);
        setProducts(result);
      } catch (err) {
        handleError(err);
      }
    };

    fetchProducts();
  }, []);

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
      <br />
      <br />
      <div>
        <h3>Demo Products</h3>

        {products &&
          products?.map((item, index) => (
            <ul key={index}>
              <span>
                {item.name}: {item.price}
              </span>
            </ul>
          ))}
      </div>
      <br />
      <button onClick={handleLogout}>Logout</button>
      <ToastContainer></ToastContainer>
    </div>
  );
};

export default Home;
