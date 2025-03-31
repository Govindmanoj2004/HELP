import React from "react";
import { Route, Routes } from "react-router-dom";
import LegalSupportHome from "./LegalSupportHome";

const LegalSupportRouter = () => {
  return (
    <Routes>
      <Route path="/home/*" element={<LegalSupportHome />} />
    </Routes>
  );
};

export default LegalSupportRouter;