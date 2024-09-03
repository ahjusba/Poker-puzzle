import '../index.css'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/puzzle">Puzzle</Link></li>
        <li><Link to="/submit">Submit</Link></li>
      </ul>
    </nav>
  )
}

export default Navbar