import '../css/App.css';
import { Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logo from '../imgs/logo.png';

export default function Navigationbar() {
  const reloadHome = () => {
    window.location.reload(false);
  };

  return (
    <div>
      {/* Barre de navigation, située en haut de page */}
      <Navbar collapseOnSelect expand="sm" style={{ backgroundColor: "#57C528" }} variant="dark">
        <Container className="blueFont">
          <Navbar.Brand onClick={reloadHome}>
            <img src={logo} alt="Logo" className="logo" />
            <Link to="/" className="titleNavbar">
              <p className="subtitleNavbar">
                The statistics of your routes in a few clicks!
              </p>
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Link to="admin" className="subtitleNavbar">
              Admin login
            </Link>
            <Link to="boss-stats" className="subtitleNavbar" style={{ marginLeft: "20px" }}>
              Global Statistics
            </Link>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}
