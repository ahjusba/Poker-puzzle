import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PuzzlePage from './pages/PuzzlePage'
import SubmitPage from './pages/SubmitPage'

const App = () => {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/puzzle" element={<PuzzlePage />} />
          <Route path="/puzzle/:id" element={<PuzzlePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/" element={<PuzzlePage />} />
        </Routes>
        <Logo />
      </div>
    </Router>
  )
}

const Logo = () => {
  return (
    <div>
      <img
        src="/pokerikerho_logo_läpinäkyvä.png"  // Path relative to the public folder
        alt="Pokerikerho Logo"
        className="logo"
      />
    </div>
  )
}

export default App