import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PuzzlePage from './pages/PuzzlePage'
import SubmitPage from './pages/SubmitPage'
import './index.css'
import { HandProvider } from './context/HandProvider'

const App = () => {
  return (
    <HandProvider>      
      <Router>
        <div className="allContent">
          <Navbar />
          <Routes>
            <Route path="/puzzle" element={<PuzzlePage />} />
            <Route path="/puzzle/:id" element={<PuzzlePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/" element={<PuzzlePage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </HandProvider>
  )
}



export default App