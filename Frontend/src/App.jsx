import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PuzzlePage from './pages/PuzzlePage'
import SubmitPage from './pages/SubmitPage'
import './index.css'

const App = () => {
  return (
    <Router>
      <div className="allContent">
        <Navbar />
        <div className="pageContent">
          <Routes>
            <Route path="/puzzle" element={<PuzzlePage />} />
            <Route path="/puzzle/:id" element={<PuzzlePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/" element={<PuzzlePage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}



export default App