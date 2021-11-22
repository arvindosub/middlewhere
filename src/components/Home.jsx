import React from "react";

function Home() {
  return (
    <div className="header">
      <div className="container-body">
        <div className="row-main">
          <div className="col-2">
            <h1>Looking for a Home?</h1>
            <p>Say goodbye to <i>pesky middlemen</i> and <i>hidden fees</i>!</p>
            <a href="/listings" className="btn btn-primary">View Listings &#10097;&#10097;&#10097;</a>
          </div>
          <div className="col-2">
            <img src="./images/blockchain-smart-contracts.png" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;