import React, { Component } from 'react';

class LoanPortal extends Component {

  showThis(name) {
    if (name == "loan") {
      var x = document.getElementById("loan")
      var y = document.getElementById("lend")
      x.style.display = "block"
      y.style.display = "none"
    } else {
      var x = document.getElementById("lend")
      var y = document.getElementById("loan")
      x.style.display = "block"
      y.style.display = "none"
    }
  }

  render () {
    return (
      <div className="container-body" style={{ maxWidth: "1200px" }}>
        <div id="loan" style={{ display: "block" }}>
          <button className="btn btn-primary" onClick={() => this.showThis("loan")}>My Loans</button>
          <button className="btn btn-warning" onClick={() => this.showThis("lend")}>Lending</button>
          <div className="subtitle1">
            <h3>Active</h3>
          </div>
          <table className="table">
            <thead>
            <tr>
                <th scope="col">Loan ID</th>
                <th scope="col">Prop ID</th>
                <th scope="col">Amount</th>
                <th scope="col">Duration</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
                <th scope="col"></th>
            </tr>
            </thead>
            <tbody id="loans">
            {this.props.loans.map((loan, key) => {
                const loanStatus = ['NONE', 'APPLIED', 'IN_FORCE', 'COMPLETE']
                if (loan.buyer === this.props.account && loan.currState === "2") {
                return (
                    <tr key={key}>
                    <th scope="row">{loan.loanID.toString()}</th>
                    <td scope="row">{loan.propID.toString()}</td>
                    <td>${window.web3.utils.fromWei(loan.balamount.toString(), 'Ether')*this.props.ethToDollars}</td>
                    <td scope="row">{loan.balduration.toString()}</td>
                    <td scope="row">{loanStatus[loan.currState]}</td>
                    <td><button type="submit" className="btn btn-primary"
                      name={loan.loanID}
                      value={loan.balamount/loan.balduration}
                      onClick={(event) => {
                        this.props.payMortgage(event.target.name, event.target.value)
                      }}>Pay Mortgage</button>
                    </td>
                    <td><button type="submit" className="btn btn-warning"
                        name={loan.loanID}
                        value={loan.balamount}
                        onClick={(event) => {
                        this.props.payMortgage(event.target.name, event.target.value)
                      }}>Pay Remainder</button>
                    </td>
                    </tr>
                )
                }
            })}
            </tbody>
          </table>
          <br />
          <div className="row">
            <div className="col-2">
              <div className="subtitle2">
                <h3>Applications</h3>
              </div>
              <table className="table">
                  <thead>
                  <tr>
                      <th scope="col">Loan ID</th>
                      <th scope="col">Prop ID</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Duration</th>
                      <th scope="col">Status</th>
                      <th scope="col"></th>
                  </tr>
                  </thead>
                  <tbody id="loans">
                  {this.props.loans.map((loan, key) => {
                      const loanStatus = ['NONE', 'APPLIED', 'IN_FORCE', 'COMPLETE']
                      if (loan.buyer === this.props.account && loan.currState === "1") {
                      return (
                          <tr key={key}>
                          <th scope="row">{loan.loanID.toString()}</th>
                          <td scope="row">{loan.propID.toString()}</td>
                          <td>${window.web3.utils.fromWei(loan.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                          <td scope="row">{loan.duration.toString()}</td>
                          <td scope="row">{loanStatus[loan.currState]}</td>
                          <td><button type="submit" className="btn btn-outline-primary"
                          name={loan.loanID}
                          onClick={(event) => {
                              this.props.cancelLoan(event.target.name)
                          }}>Cancel</button>
                          </td>
                          </tr>
                      )
                      }
                  })}
                  </tbody>
              </table>
            </div>
            <div className="col-2" style={{ alignSelf: "start" }}>
              <div className="subtitle2">
                <h3>Offers</h3>
              </div>
              <table className="table">
                  <thead>
                  <tr>
                      <th scope="col">Loan ID</th>
                      <th scope="col">Provider</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Duration</th>
                      <th scope="col"></th>
                  </tr>
                  </thead>
                  <tbody id="loans">
                  {this.props.loanOffers.map((loanOffer, key) => {
                    return(
                      this.props.loanEscrows.map((loanEscrow) => {
                        if (loanOffer.buyer === this.props.account && loanOffer.loanID === loanEscrow.loanID && loanEscrow.provider === this.props.account) {
                        return (
                            <tr key={key}>
                            <th scope="row">{loanOffer.loanID.toString()}</th>
                            <td scope="row">{loanOffer.provider.toString().substring(0,10)}</td>
                            <td>${window.web3.utils.fromWei(loanOffer.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                            <td scope="row">{loanOffer.duration.toString()}</td>
                            <td><button type="submit" className="btn btn-primary"
                                name={loanOffer.loanID}
                                value={loanOffer.provider}
                                onClick={(event) => {
                                this.props.acceptLoan(event.target.name, event.target.value)
                                }}>Accept Loan</button>
                            </td>
                            </tr>
                        )
                        }
                      })  
                    )
                  })}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
        <div id="lend" style={{ display: "none" }}>
          <button className="btn btn-primary" onClick={() => this.showThis("loan")}>My Loans</button>
          <button className="btn btn-warning" onClick={() => this.showThis("lend")}>Lending</button>
          <div className="row">
            <div className="col-2">
              <div className="subtitle1">
                <h3>Offer</h3>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Loan ID</th>
                    <th scope="col">Prop ID</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Duration</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody id="loans">
                  {this.props.loans.map((loan, key) => {
                    if (loan.currState === "1" && loan.buyer !== this.props.account) {
                      return (
                        <tr key={key}>
                        <th scope="row">{loan.loanID.toString()}</th>
                        <td scope="row">{loan.propID.toString()}</td>
                        <td>${window.web3.utils.fromWei(loan.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                        <td scope="row">{loan.duration.toString()}</td>
                        <td><button type="submit" className="btn btn-warning" 
                          name={loan.loanID}
                          onClick={(event) => {
                          this.props.offerLoan(event.target.name)
                          }}>Offer Loan</button>
                        </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>
            <div className="col-2" style={{ alignSelf: "start" }}>
              <div className="subtitle1">
                <h3>Disbursed</h3>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Loan ID</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Status</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody id="loans">
                  {this.props.loanEscrows.map((loanEscrow, key) => {
                    const loanEscrowStatus = ['NONE', 'ACCEPTED', 'DISBURSED', 'COMPLETE']
                    if (loanEscrow.currState === "1" && loanEscrow.provider === this.props.account) {
                      return (
                        <tr key={key}>
                          <th scope="row">{loanEscrow.loanID.toString()}</th>
                          <td>${window.web3.utils.fromWei(loanEscrow.amount.toString(), 'Ether')*this.props.ethToDollars}</td>
                          <td scope="row">{loanEscrow.duration.toString()}</td>
                          <td scope="row">{loanEscrowStatus[loanEscrow.currState]}</td>
                          <td><button type="submit" className="btn btn-warning" 
                            name={loanEscrow.loanID}
                            value={loanEscrow.amount}
                            onClick={(event) => {
                              this.props.disburseLoan(event.target.name, event.target.value)
                            }}>Disburse Loan</button>
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>  
        </div>
      </div>
    )
  }
}

export default LoanPortal;