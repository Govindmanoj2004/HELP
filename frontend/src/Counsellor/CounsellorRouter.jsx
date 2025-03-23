import React from "react";
import { Route, Routes } from "react-router-dom";
import CounsellorHome from './CounsellorHome';

const CounsellorRouter = () => {
  return (
    <Routes>
      <Route path="/home/*" element={<CounsellorHome />} />
    </Routes>
  );
};

export default CounsellorRouter;
