import React from "react";
import { Route, Routes } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import GuestHome from "./GuestHome";
import GuestSoS from "./GuestSoS";

const RouterGuest = () => {
  return (
    <Routes>
      <Route path="/" element={<GuestHome />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sos" element={<GuestSoS />} />
    </Routes>
  );
};

export default RouterGuest;
