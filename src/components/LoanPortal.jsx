import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";

class LoanPortal extends Component {

  state = {
    offer: 0,
    modal: 0
  }
  openModalAdd = () => this.setState({ modal: 1 })
  closeModal = () => this.setState({ modal: 0 })

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
                    <td>${loan.balamount.toString()}</td>
                    <td scope="row">{loan.balduration.toString()}</td>
                    <td scope="row">{loanStatus[loan.currState]}</td>
                    <td><button type="submit" className="btn btn-primary"
                      name={loan.loanID}
                      value={loan.balamount/loan.balduration}
                      onClick={(event) => {
                        this.props.payMortgage(event.target.name)
                      }}>Pay Mortgage</button>
                    </td>
                    <td><button type="submit" className="btn btn-warning"
                        name={loan.loanID}
                        value={loan.balamount}
                        onClick={(event) => {
                        this.props.payBalance(event.target.name)
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
                          <td>${loan.amount.toString()}</td>
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
                  {this.props.loffers.map((loanOffer, key) => {
                    return(
                      this.props.lescrows.map((loanEscrow) => {
                        if (loanOffer.buyer === this.props.account && loanOffer.loanID === loanEscrow.loanID && loanEscrow.provider === this.props.account) {
                        return (
                            <tr key={key}>
                            <th scope="row">{loanOffer.loanID.toString()}</th>
                            <td scope="row">{loanOffer.provider.toString().substring(0,10)}</td>
                            <td>${loanOffer.amount.toString()}</td>
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
          <div className="row" style={{ minWidth: "150px" }}>
            <Modal show={this.state.modal === 1} onHide={this.closeModal}>
              <Modal.Header>
                <Modal.Title><b>Top-Up Tokens</b></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const value = this.val.value
                  this.props.topupTokens(value)
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="val"
                      type="text"
                      ref={(input) => { this.val = input }}
                      className="form-control"
                      placeholder="ETH to Convert"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary">Top-Up Tokens</button>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeModal}>Cancel</Button>
              </Modal.Footer>
            </Modal>
            <Button variant="success" onClick={this.openModalAdd}>
              Top-Up Tokens &#10097;&#10097;&#10097;
            </Button>
          </div>
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
                        <td>${loan.amount.toString()}</td>
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
                <h3>Disburse</h3>
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
                  {this.props.lescrows.map((loanEscrow, key) => {
                    const loanEscrowStatus = ['NONE', 'ACCEPTED', 'DISBURSED', 'COMPLETE']
                    if (loanEscrow.currState === "1" && loanEscrow.provider === this.props.account) {
                      return (
                        <tr key={key}>
                          <th scope="row">{loanEscrow.loanID.toString()}</th>
                          <td>${loanEscrow.amount.toString()}</td>
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