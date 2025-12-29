import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import { BrowserRouter as Router } from 'react-router-dom'

import AppRoutes from './Routes'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router basename='/'>
        <AppRoutes />
      </Router>
    </>
  )
}

export default App
