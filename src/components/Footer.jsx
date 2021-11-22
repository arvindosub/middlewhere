import React from "react";

function Footer() {
  return (
    <div className="footer">
      <footer className="m-0 text-center text-white">
        <div className="container-footer">
          <div className="row">
            <div className="footer-col-1">
              <h5>Download Our App</h5>
              <p>Available on Android/iOS. Get it at your App Store now!</p>
              <div className="app-logo">
                <img src="images/logo-gplay.png" />
                <img src="images/logo-aplstore.png" />
              </div>
            </div>
            <div className="footer-col-2">
              <hr />
              <p className="copyright">Copyright &copy; ArvindS (A0228522J) - 2021</p>
              <hr />
            </div>
            <div className="footer-col-3">
              <img src="images/tools.png" />
              <p>Bringing you the power of <i>Smart Contracts</i>!</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;