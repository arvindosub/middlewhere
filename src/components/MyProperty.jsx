import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { create } from 'ipfs-http-client';
const ipfsClient = create('https://ipfs.infura.io:5001/api/v0')

class MyProperty extends Component {
  
  state = { 
    modal: 0,
    buffer: null,
    imgChg: false
  }
  openModalAdd = () => this.setState({ modal: 1 })
  openModalEdit = () => this.setState({ modal: 2 })
  closeModal = () => this.setState({ modal: 0 })

  captureFile = (event) => {
    event.preventDefault()
    const img = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(img)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result), imgChg: true })
    }
  }

  render() {
    return (
      <div className="container-body">
        <div id="content" className="myprop">
          <h1>Owned Property</h1>
          <br />
          <table className="table rounded">
            <thead>
              <tr>
                <th scope="col">Prop ID</th>
                <th scope="col">Title</th>
                <th scope="col">Value</th>
                <th scope="col">Description</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody id="propList">
              { this.props.property.map((property, key) => {
                if (property.propOwner === this.props.account) {
                  return (
                    <tr key={key}>
                      <th scope="row">{property.propID.toString()}</th>
                      <td style={{ textAlign: 'left' }}><img src={property.imgURL} className="img-thumbnail" style={{ maxWidth: '100px', marginRight: "30px", marginLeft: "0px", marginTop: "0px" }} />{property.propTitle}</td>
                      <td>${window.web3.utils.fromWei(property.propValue.toString(), 'Ether')*this.props.ethToDollars}</td>
                      <td>{property.propDescription}</td>
                      <td>{property.pendingSale ? 'On Sale' : '' }</td>
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
          <hr />
          <br/>
          <div className="row" style={{ minWidth: "150px" }}>
            <Modal show={this.state.modal === 1} onHide={this.closeModal}>
              <Modal.Header>
                <Modal.Title><b>Add Property</b></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                 <form onSubmit={async (event) => {
                    event.preventDefault()
                    var imgURL = ''
                    if (this.state.buffer !== null) {
                      const imgAdd = await ipfsClient.add(this.state.buffer)
                      imgURL = `https://ipfs.infura.io/ipfs/${imgAdd.path}`
                      this.setState({ buffer: null })
                    }
                    const title = this.tit.value
                    const address = this.add.value
                    let ethValue = this.val.value / this.props.ethToDollars
                    const value = window.web3.utils.toWei(ethValue.toString(), 'Ether')
                    const description = this.desc.value
                    this.props.addProperty(title, address, description, value, imgURL)
                  }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="tit"
                      type="text"
                      ref={(input) => { this.tit = input }}
                      className="form-control"
                      placeholder="Title"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="add"
                      type="text"
                      ref={(input) => { this.add = input }}
                      className="form-control"
                      placeholder="Address"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <textarea
                      id="desc"
                      type="text"
                      rows="5"
                      cols="50"
                      ref={(input) => { this.desc = input }}
                      className="form-control"
                      placeholder="Description"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="val"
                      type="text"
                      ref={(input) => { this.val = input }}
                      className="form-control"
                      placeholder="Value"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pic"
                      type="file"
                      onChange={this.captureFile}
                      className="form-control" />
                  </div>
                  <button type="submit" className="btn btn-primary">Add Property</button>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeModal}>Cancel</Button>
              </Modal.Footer>
            </Modal>
            <Button variant="success" onClick={this.openModalAdd}>
              Add &#10097;&#10097;&#10097;
            </Button>
            <Modal show={this.state.modal === 2} onHide={this.closeModal}>
              <Modal.Header>
                <Modal.Title><b>Edit Property</b></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  var id = this.pID.value - 1
                  const rbs = document.querySelectorAll('input[name="choice"]');
                  var pendSale = this.props.property[id].pendingSale
                  for (const rb of rbs) {
                    if (rb.checked) {
                      if (rb.value == "yes") {
                        pendSale = true
                      } else {
                        pendSale = false
                      }
                      break;
                    }
                  }
                  var newTitle = this.pTitle.value
                  if (this.pTitle.value === null || this.pTitle.value === '') {
                    newTitle = this.props.property[id].propTitle
                  }
                  var newValue = window.web3.utils.toWei((this.pValue.value/this.props.ethToDollars).toString(), 'Ether')
                  if (this.pValue.value === null || this.pValue.value === '') {
                    newValue = this.props.property[id].propValue
                  }
                  var newDesc = this.pDesc.value
                  if (this.pDesc.value === null || this.pDesc.value === '') {
                    newDesc = this.props.property[id].propDescription
                  }
                  var newImg = this.props.property[id].imgURL
                  if (this.state.imgChg === true) {
                    const newAdd = await ipfsClient.add(this.state.buffer)
                    newImg = `https://ipfs.infura.io/ipfs/${newAdd.path}`
                    this.setState({ buffer: null, imgChg: false })
                  }
                  this.props.editProperty(id+1, newTitle, newDesc, newValue, pendSale, newImg)
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pID"
                      type="text"
                      ref={(input) => { this.pID = input }}
                      className="form-control"
                      placeholder="Property ID (required)"
                      required
                    />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pTitle"
                      type="text"
                      ref={(input) => { this.pTitle = input }}
                      className="form-control"
                      placeholder="Title"
                    />
                  </div>
                  <div className="form-group mr-sm-2">
                    <textarea
                      id="pDesc"
                      type="text"
                      rows="5"
                      cols="50"
                      ref={(input) => { this.pDesc = input }}
                      className="form-control"
                      placeholder="Description"
                    />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pValue"
                      type="text"
                      ref={(input) => { this.pValue = input }}
                      className="form-control"
                      placeholder="Value"
                    />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="pImg"
                      type="file"
                      onChange={this.captureFile}
                      className="form-control" />
                  </div>
                  <p />
                  <big>For Sale?</big>
                  <div className="form-check inline-block">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="choice" value="yes" id="choice-yes" /> 
                      <label className="form-check-label" htmlFor="choice-yes">Yes</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="choice" value="no" id="choice-no" />
                      <label className="form-check-label" htmlFor="choice-no">No</label>
                    </div>
                  </div>
                  <p />
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeModal}>Close</Button>
              </Modal.Footer>
            </Modal>
            <Button variant="warning" onClick={this.openModalEdit}>
              Edit &#10097;&#10097;&#10097;
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default MyProperty;