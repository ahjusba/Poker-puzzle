import './Navbar.css'
import { Link } from 'react-router-dom'
import { stack as Menu } from 'react-burger-menu'
import '../index.css'

const Navbar = () => {
  return (
    <div className="navbar">
      <Menu right>
        <CustomLink to="/">Home</CustomLink>
        <CustomLink to="/puzzle">Puzzle</CustomLink>
        <CustomLink to="/submit">Submit</CustomLink>
      </Menu>
    </div>
    
  )
}

const CustomLink = ({to, children, ...props}) => {
  return (
      <Link to={to} {...props}>
        {children}
      </Link>
  )
}

export default Navbar