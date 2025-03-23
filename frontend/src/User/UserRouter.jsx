import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './UserHome'
import Settings from './Settings'
import Shelter from './Shelter'
import Counsellor from './Counsellor'
const RouterGuest = () => {
  return (
    <Routes>
        <Route path='/home/*' element={<Home />} />
        <Route path='/settings/*' element={<Settings/>} />
        <Route path='/shelters/*' element={<Shelter/>} />
        <Route path='/counsellor/*' element={<Counsellor/>} />
    </Routes>
  )
}

export default RouterGuest