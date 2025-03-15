import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './UserHome'
import Settings from './Settings'
const RouterGuest = () => {
  return (
    <Routes>
        <Route path='/home/*' element={<Home />} />
        <Route path='/settings/*' element={<Settings/>} />
    </Routes>
  )
}

export default RouterGuest