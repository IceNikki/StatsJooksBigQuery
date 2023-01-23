////////////////////////// Composant barre de navigation /////////////////////

import '../css/App.css';
import { Link } from "react-router-dom";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import logo from '../imgs/logo.png';

export default function Navigationbar() {
  return (
    <div>
    {/* Barre de navigation, située en haut de page */} 
      <Navbar collapseOnSelect expand="sm" bg="light" variant="light">
      <Container className="blueFont">
        <Navbar.Brand>
        <img src={logo} />
        <Link to="/" className="titleNavbar">
            
            <p className='subtitleNavbar'>The statistics of your routes in a few clicks !</p>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle />

        {/* Bouton de redirection vers la page admin */}
        <Navbar.Collapse className="justify-content-end">
        <Link to="admin" className="subtitleNavbar">
            Admin login
          </Link>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}
