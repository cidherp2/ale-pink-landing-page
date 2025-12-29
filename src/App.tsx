import { BrowserRouter as Router } from 'react-router-dom'

import AppRoutes from './Routes'

import './App.css'

function App() {


  return (
    <>
      <Router basename='/'>
        <AppRoutes />
      </Router>
    </>
  )
}

export default App
