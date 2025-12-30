import { BrowserRouter as Router } from 'react-router-dom'
import GlobalStyle from './utils/GlobalStyles'
import AppRoutes from './Routes'
import './App.css'


function App() {

  return (
    <>
      <GlobalStyle />
      <Router basename='/'>
        <AppRoutes />
      </Router>
    </>
  )
}

export default App
