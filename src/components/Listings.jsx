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
          {this.props.property.map((property, key) => {
            if (property.pendingSale === true && property.propOwner !== this.props.account) {
               return (
                <div id="card" key={key} className="col-sm  border rounded shadow overflow-hidden" style={{ maxWidth: '350px', marginTop: "0px" }}>
                  <img src={property.imgURL} className="img-thumbnail" style={{ maxWidth: '300px' }} />
                  <div>
                    <h5 className="font-bold">{property.propTitle}</h5>
                    <small>{property.propDescription}</small>
                  </div>
                  <div id="listing" className="box-black">
                    <h5 className="text-white font-bold">S$ {(window.web3.utils.fromWei(property.propValue.toString(), 'Ether'))*this.props.ethToDollars}</h5>
                    <form className="form-inline" onSubmit={(event) => {
                      event.preventDefault()
                      const myOffer = window.web3.utils.toWei((this.state.offer/this.props.ethToDollars).toString(), 'Ether')
                      const propID = property.propID
                      this.props.makeOffer(propID, myOffer)
                      this.setState({ offer: 0})
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
            } else if (property.pendingSale === true) {
              return (
                <div key={key} className="col-sm  border rounded shadow overflow-hidden" style={{ maxWidth: '350px', marginTop: "0px" }}>
                  <img src={property.imgURL} className="img-thumbnail" style={{ maxWidth: '300px' }} />
                  <div>
                    <h5 className="font-bold">{property.propTitle}</h5>
                    <small>{property.propDescription}</small>
                  </div>
                  <div className="box-black">
                    <h5 className="text-white font-bold">S$ {(window.web3.utils.fromWei(property.propValue.toString(), 'Ether'))*this.props.ethToDollars}</h5>
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