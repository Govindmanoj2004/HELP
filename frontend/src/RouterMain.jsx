import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RouterGuest from './Guest/GuestRouter';
import RouterUser from './User/UserRouter';
import RouterOfficier from './Officier/OfficierRouter'
import CounsellorRouter from './Counsellor/CounsellorRouter';
import LegalSupportRouter from './LegalSupport/LegalSupportRouter';

const RouterMain = () => {
  return (
    <Routes>
      <Route path='/user/*' element={<RouterUser/>} />
      <Route path='/*' element={<RouterGuest/>} />
      <Route path='/officer/*' element={<RouterOfficier/>} />
      <Route path='/counsellor/*' element={<CounsellorRouter/>} />
      <Route path='/legalsupport/*' element={<LegalSupportRouter/>} />
    </Routes>
  );
};

export default RouterMain;