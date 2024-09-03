import './Navbar.css'
import { Link } from 'react-router-dom'
import { stack as Menu } from 'react-burger-menu'

const Navbar = () => {
  return (
    <Menu right>
      <CustomLink to="/">home</CustomLink>
      <CustomLink to="/puzzle">puzzle</CustomLink>
      <CustomLink to="/submit">submit</CustomLink>
    </Menu>
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