import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import GuestHome from "./GuestHome";

const RouterGuest = () => {
  return (
    <Routes>
      <Route path="/" element={<GuestHome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default RouterGuest;
