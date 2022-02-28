import React, { Component } from 'react';

class Listings extends Component {

  state = {
    offer: 0
  }
  updateOffer = (event) => this.setState({ offer: event.target.value })

  render () {
    return (
      <div className="container-fluid">
        <h1 className="listings" style={{ marginBottom: "0px" }}>Current Listings</h1>
        <div id="content" className="row" style={{ marginTop: "0px" }}>
          {
          this.props.escrows.map((escrow, key) => {
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
                    <h5 className="text-white font-bold">S$ {(window.web3.utils.fromWei(val.toString(), 'Ether'))*this.props.ethToDollars}</h5>
                    <form className="form-inline" onSubmit={(event) => {
                      event.preventDefault()
                      const myOffer = window.web3.utils.toWei((this.state.offer/this.props.ethToDollars).toString(), 'Ether')
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
                    <h5 className="text-white font-bold">S$ {(window.web3.utils.fromWei(val.toString(), 'Ether'))*this.props.ethToDollars}</h5>
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