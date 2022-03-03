import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";

class Listings extends Component {

  state = {
    offer: 0,
    modal: 0
  }
  updateOffer = (event) => this.setState({ offer: event.target.value })
  openModalAdd = () => this.setState({ modal: 1 })
  closeModal = () => this.setState({ modal: 0 })

  render () {
    return (
      <div className="container-fluid">
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
        <h1 className="listings" style={{ marginBottom: "0px" }}>Current Listings</h1>
        <div id="content" className="row" style={{ marginTop: "0px" }}>
          {
          this.props.pescrows.map((escrow, key) => {
            var img = ''
            var tit = ''
            var des = ''
            var val = 0
            var ind = 0
            var pid = 0
            if (escrow.salePercent > 0 && escrow.stakeOwner !== this.props.account) {
              this.props.property.map((property, idx) => {
                if (property.propID === escrow.propID) {
                  img = property.imgURL
                  tit = property.propTitle
                  des = property.propDescription
                  val = escrow.value * (escrow.salePercent/100)
                  ind = idx
                  pid = property.propID
                }
              })
              return (
                <div id="card" key={ind} className="col-sm  border rounded shadow overflow-hidden" style={{ maxWidth: '350px', marginTop: "0px" }}>
                  <img src={img} className="img-thumbnail" style={{ maxWidth: '300px' }} />
                  <div>
                    <h5 className="font-bold">{tit}</h5>
                    <small>{des}</small>
                  </div>
                  <div id="listing" className="box-black">
                    <h5 className="text-white font-bold">S$ {val.toString()}</h5>
                    <form className="form-inline" onSubmit={(event) => {
                      event.preventDefault()
                      const myOffer = this.state.offer.toString()
                      const propID = pid
                      const owner = escrow.stakeOwner
                      this.props.makeOffer(propID, myOffer, owner)
                      this.setState({ offer:0 })
                      }}>
                      <input
                        id="cardOffer"
                        type="text"
                        onChange={(input) => { this.updateOffer(input) }}
                        className="form-offer"
                        required />
                      <button type="submit" className="btn btn-primary" style={{ marginTop: "0px", marginBottom: "10px"  }}>Make Offer</button>
                    </form>
                  </div>
                </div>
              )
            } else if (escrow.salePercent > 0) {
              this.props.property.map((property, idx) => {
                if (property.propID === escrow.propID) {
                  img = property.imgURL
                  tit = property.propTitle
                  des = property.propDescription
                  val = escrow.value * (escrow.salePercent/100)
                  ind = idx
                }
              })
              return (
                <div key={ind} className="col-sm  border rounded shadow overflow-hidden" style={{ maxWidth: '350px', marginTop: "0px" }}>
                  <img src={img} className="img-thumbnail" style={{ maxWidth: '300px' }} />
                  <div>
                    <h5 className="font-bold">{tit}</h5>
                    <small>{des}</small>
                  </div>
                  <div className="box-black">
                    <h5 className="text-white font-bold">S$ {val.toString()}</h5>
                  </div>
                </div>
              )
            }
          })}
        </div>
      </div>
    )
  }
}

export default Listings;