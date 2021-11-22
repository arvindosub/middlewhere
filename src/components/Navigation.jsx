import React from "react";
import { Link, withRouter } from "react-router-dom";

function Navigation(props) {
  return (
    <div className="navigation">
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img className="d-inline-block" src="./images/logo.png" width="350" height="120" />
          </Link>
          <div>
            <ul className="navbar-nav ml-auto">
              <li
                className={`nav-item  ${
                  props.location.pathname === "/" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/">
                  Home
                  <span className="active"></span>
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/myprop" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/myprop">
                  MyProperty
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/listings" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/listings">
                Listings
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/buy" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/buy">
                  Buy
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/sell" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/sell">
                  Sell
                </Link>
              </li>
              <li
                className={`nav-item  ${
                  props.location.pathname === "/loans" ? "active" : ""
                }`}
              >
                <Link className="nav-link" to="/loans">
                  LoanPortal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default withRouter(Navigation);
