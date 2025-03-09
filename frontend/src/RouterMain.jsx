import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RouterGuest from './Guest/GuestRouter';
import RouterUser from './User/UserRouter';

const RouterMain = () => {
  return (
    <Routes>
      <Route path='/user/*' element={<RouterUser/>} />
      <Route path='/guest/*' element={<RouterGuest/>} />
    </Routes>
  );
};

export default RouterMain;