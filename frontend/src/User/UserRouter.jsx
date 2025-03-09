import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './UserHome'
const RouterGuest = () => {
  return (
    <Routes>
        <Route path='/home' element={<Home />} />
    </Routes>
  )
}

export default RouterGuest