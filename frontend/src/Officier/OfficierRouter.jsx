import React from 'react'
import { Route, Routes } from 'react-router-dom'
import OfficierHome from './OfficierHome'
import AnonymusSos from './AnonymusSos'
import Settings from './Settings'

const RouterGuest = () => {
  return (
    <Routes>
      <Route path='/home' element={<OfficierHome />} />
      <Route path='/anonymusSos' element={<AnonymusSos />} />
      <Route path='/settings' element={<Settings />} />
    </Routes>
  )
}

export default RouterGuest