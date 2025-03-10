import React from 'react'
import { Route, Routes } from 'react-router-dom'
import OfficierHome from './OfficierHome'

const RouterGuest = () => {
  return (
    <Routes>
      <Route path='/home' element={<OfficierHome />} />
    </Routes>
  )
}

export default RouterGuest