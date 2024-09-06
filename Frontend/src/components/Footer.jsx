import '../index.css'

const Footer = () => {
  return (
    <div className="footer">
      <Logo />
      <p>ahjusba 2024</p>
    </div>
  )
}

const Logo = () => {
  return (
    <img
      src="../pokerikerho_logo_läpinäkyvä.png"  // Path relative to the public folder
      alt="Pokerikerho Logo"
      className="logo"
    />
  )
}

export default Footer