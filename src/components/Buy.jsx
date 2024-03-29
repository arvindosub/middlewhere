import React, { Component } from 'react';

class Buy extends Component {
  render () {
    return (
      <div className="container-body">
        <div id="content" className="buy">
          <h1>Buy Property</h1>
          <div className="subtitle">
            <h3>Offers Made</h3>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Prop ID</th>
                <th scope="col">Asking Price</th>
                <th scope="col">Offer Amount</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="offers">
              {this.props.poffers.map((offer, key) => {
                if (offer.buyer === this.props.account && offer.currState === "0") {
                  var val = 0
                  this.props.pescrows.map((escrow, idx) => {
                    if (escrow.stakeOwner === offer.stakeOwner) {
                      val = escrow.value *(escrow.salePercent/100)
                    }
                  })
                  return (
                    <tr key={key}>
                        <th scope="row">{offer.propID.toString()}</th>
                        <td>${val.toString()}</td>
                        <td>${offer.amount.toString()}</td>
                        <td><button type="submit" className="btn btn-outline-primary"
                          name={offer.propID}
                          onClick={(event) => {
                            this.props.cancelOffer(event.target.name, offer.stakeOwner)
                        }}>Cancel Offer</button></td>
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
                <th scope="col"></th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody id="escrows">
              {this.props.pescrows.map((escrow, key) => {
                const status = ['NONE', 'AWAITING_PAYMENT', 'AWAITING_TRANSFER', 'COMPLETE']
                if (escrow.currState !== "0" && escrow.currState !== "3" && escrow.buyer === this.props.account) {
                  return (
                    <tr key={key}>
                      <th scope="row">{escrow.propID.toString()}</th>
                      <td>${escrow.amount.toString()}</td>
                      <td>{status[escrow.currState]}</td>
                      <td><button type="submit" className="btn btn-warning" 
                        name={escrow.propID}
                        value={escrow.amount}
                        onClick={(event) => {
                          console.log(escrow.amount)
                          this.props.purchaseProperty(event.target.name, escrow.stakeOwner)
                      }}>Make Payment</button></td>
                      <td>
                        <form onSubmit={(event) => {
                          event.preventDefault()
                          //let ethval = this.amt.value
                          //const myamt = window.web3.utils.toWei(ethval.toString(), 'Ether')
                          const myamt = this.amt.value.toString()
                          const myid = escrow.propID
                          const mydur = this.dur.value
                          this.props.createLoan(myid, myamt, mydur)
                          }}>
                          <div className="form-group mr-sm-2">
                            <input
                              id="amt"
                              type="text"
                              ref={(input) => { this.amt = input }}
                              className="form-control"
                              placeholder="Amount"
                              required />
                            <input
                              id="dur"
                              type="number"
                              ref={(input) => { this.dur = input }}
                              className="form-control"
                              placeholder="Duration"
                              required />  
                          </div>
                          <button type="submit" className="btn btn-primary">Apply for Loan</button>
                        </form>
                      </td>
                      <td><button type="submit" className="btn btn-outline-primary"
                        name={escrow.propID}
                        onClick={(event) => {
                          this.props.cancelOffer(event.target.name, escrow.stakeOwner)
                      }}>Cancel Offer</button></td>
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

export default Buy;