import React, { Component } from 'react';

class Sell extends Component {
  render() {
    return (
      <div className="container-body">
        <div id="content" className="sell">
          <h1>Sell Property</h1>
          <div className="subtitle">
            <h3>Offers Received</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Prop ID</th>
                <th scope="col">Asking Price</th>
                <th scope="col">Offer Amount</th>
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="offers">
              { this.props.offers.map((offer, key) => {
                if (this.props.property[offer.propID-1].propOwner === this.props.account) {
                  return (
                    <tr key={key}>
                      <th scope="row">{offer.propID.toString()}</th>
                      <td>${window.web3.utils.fromWei(this.props.property[offer.propID-1].propValue.toString(), 'Ether')*this.props.ethToDollars}</td>
                      <td>${window.web3.utils.fromWei(offer.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                      <td><button type="submit" className="btn btn-warning" 
                        name={offer.propID}
                        value={offer.buyer}
                        onClick={(event) => {
                          this.props.acceptOffer(event.target.name, event.target.value)
                      }}>Accept Offer</button></td>
                      <td><button type="submit" className="btn btn-outline-primary"
                        name={offer.propID}
                        value={offer.buyer}
                        onClick={(event) => {
                          this.props.rejectOffer(event.target.name, event.target.value)
                      }}>Reject Offer</button></td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
          <div className="subtitle">
            <h3>Escrow Contracts</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Prop ID</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="escrows">
              {this.props.escrows.map((escrow, key) => {
                const status = ['NONE', 'AWAITING_PAYMENT', 'AWAITING_TRANSFER', 'COMPLETE']
                if (escrow.currState !== "0" && escrow.currState !== "3" && escrow.propOwner === this.props.account) {
                  return (
                    <tr key={key}>
                      <th scope="row">{escrow.propID.toString()}</th>
                      <td>${window.web3.utils.fromWei(escrow.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                      <td>{status[escrow.currState]}</td>
                      <td><button type="submit" className="btn btn-outline-primary"
                        name={escrow.propID}
                        onClick={(event) => {
                          this.props.cancelEscrow(event.target.name)
                      }}>Cancel Escrow</button></td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default Sell;
