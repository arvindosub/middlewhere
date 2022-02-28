import React, { Component } from "react";
import Web3 from 'web3';
import './App.css';
import Marketplace from './abis/Marketplace.json';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Navigation, Footer, Home, MyProperty, Listings, Buy, Sell, LoanPortal } from "./components";

class App extends Component {
  
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if(networkData) {
      const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })

      //load all property
      const propertyCount = await marketplace.methods.totalPropertyCounter().call()
      this.setState({ propertyCount })
      for (var i=1; i<=propertyCount; i++) {
        const property = await marketplace.methods.allProperty(i).call()
        this.setState({ property: [...this.state.property, property] })
      }
      console.log('All Property')
      console.log(this.state.property)

      //load all offers
      for (var a=1; a <= propertyCount; a++) {
        var offerCount = await marketplace.methods.offerCounts(a).call()
        for (var b=0; b<offerCount; b++) {
          const offer = await marketplace.methods.allOffers(a,b).call()
          this.setState({ offers: [...this.state.offers, offer] })
        }
      }
      console.log('All Offers')
      console.log(this.state.offers)

      //load all escrows
      for (var j=1; j<=propertyCount; j++) {
        const escrowCount = await marketplace.methods.escrowCounts(j).call()
        for (var k=0; k<escrowCount; k++) {
          const escrow = await marketplace.methods.allEscrows(j,k).call()
          this.setState({ escrows: [...this.state.escrows, escrow] })
        }
      }
      console.log('All Escrows')
      console.log(this.state.escrows)

      /*
      //load all loans
      const loansCount = await marketplace.methods.totalLoansCounter().call()
      this.setState({ loansCount })
      for (var k=1; k <= loansCount; k++) {
        const loan = await marketplace.methods.allLoans(k).call()
        this.setState({ loans: [...this.state.loans, loan] })
      }
      console.log('All Loans')
      console.log(this.state.loans)

      //load all loan offers
      for (var l=1; l <= loansCount; l++) {
        var loanOfferCount = await marketplace.methods.loanOfferCounts(l).call()
        for (var m=0; m < loanOfferCount; m++) {
          const loanOffer = await marketplace.methods.allLoanOffers(l,m).call()
          this.setState({ loanOffers: [...this.state.loanOffers, loanOffer] })
        }
      }
      console.log('All Loan Offers')
      console.log(this.state.loanOffers)

      //load all loan escrows
      for (var n=1; n <= loansCount; n++) {
        const loanEscrow = await marketplace.methods.allLoanEscrows(n).call()
        this.setState({ loanEscrows: [...this.state.loanEscrows, loanEscrow] })
      }
      console.log('All Loan Escrows')
      console.log(this.state.loanEscrows)
      */

      this.setState({ loading: false })

    } else {
      window.alert('Marketplace not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      propertyCount: 0,
      property: [],
      escrows: [],
      offers: [],
      //loansCount: 0,
      //loans: [],
      //loanEscrows: [],
      //loanOffers: [],
      loading: true
    }
    this.addProperty = this.addProperty.bind(this)
    this.editProperty = this.editProperty.bind(this)
    this.makeOffer = this.makeOffer.bind(this)
    this.acceptOffer = this.acceptOffer.bind(this)
    this.rejectOffer = this.rejectOffer.bind(this)
    this.cancelOffer = this.cancelOffer.bind(this)
    this.cancelDeal = this.cancelDeal.bind(this)
    this.purchaseProperty = this.purchaseProperty.bind(this)
    /*
    this.applyLoan = this.applyLoan.bind(this)
    this.cancelLoan = this.cancelLoan.bind(this)
    this.offerLoan = this.offerLoan.bind(this)
    this.acceptLoan = this.acceptLoan.bind(this)
    this.disburseLoan = this.disburseLoan.bind(this)
    this.rejectLoan = this.rejectLoan.bind(this)
    this.payMortgage = this.payMortgage.bind(this)
    */
  }

  addProperty(propTitle, propAddress, propDescription, percentage, value, imgURL) {
    this.setState({ loading: true })
    this.state.marketplace.methods.addProperty(propTitle, propAddress, propDescription, percentage, value, imgURL).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  editProperty(propID, propTitle, propDescription, value, salePercent, imgURL) {
    this.setState({ loading: true })
    this.state.marketplace.methods.editProperty(propID, propTitle, propDescription, value, salePercent, imgURL).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  makeOffer(propID, amount, stakeOwner) {
    this.setState({ loading: true })
    this.state.marketplace.methods.makeOffer(propID, amount, stakeOwner).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  acceptOffer(propID, buyer) {
    this.setState({ loading: true })
    this.state.marketplace.methods.acceptOffer(propID, buyer).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  rejectOffer(propID, buyer) {
    this.setState({ loading: true })
    this.state.marketplace.methods.rejectOffer(propID, buyer).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelOffer(propID, stakeOwner) {
    this.setState({ loading: true })
    this.state.marketplace.methods.cancelOffer(propID, stakeOwner).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelDeal(propID) {
    this.setState({ loading: true })
    this.state.marketplace.methods.cancelDeal(propID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  purchaseProperty(propID, amount) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProperty(propID).send({ from: this.state.account, value: amount }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  /*
  applyLoan(propID, amount, duration) {
    this.setState({ loading: true })
    this.state.marketplace.methods.applyLoan(propID, amount, duration).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelLoan(loanID) {
    this.setState({ loading: true })
    this.state.marketplace.methods.cancelLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  offerLoan(loanID) {
    this.setState({ loading: true })
    this.state.marketplace.methods.offerLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  acceptLoan(loanID, provider) {
    this.setState({ loading: true })
    this.state.marketplace.methods.acceptLoan(loanID, provider).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  disburseLoan(loanID, amount) {
    this.setState({ loading: true })
    this.state.marketplace.methods.disburseLoan(loanID).send({ from: this.state.account, value: amount }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  rejectLoan(loanID) {
    this.setState({ loading: true })
    this.state.marketplace.methods.rejectLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  payMortgage(loanID, amount) {
    this.setState({ loading: true })
    this.state.marketplace.methods.payMortgage(loanID).send({ from: this.state.account, value: amount }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }
  */

  render() {
    return (
      <div className="App">
        <Router>
          <Navigation />
          <Switch>
            <Route path="/" exact component={() => <Home />} />
            <Route path="/myprop" exact component={() => <MyProperty 
              account={this.state.account}
              property={this.state.property} 
              offers={this.state.offers} 
              escrows={this.state.escrows}
              //loans={this.state.loans}
              //loanOffers={this.state.loanOffers}
              //loanEscrows={this.state.loanEscrows} 
              ethToDollars={100000}
              addProperty={this.addProperty}
              editProperty={this.editProperty}
              acceptOffer={this.acceptOffer} />}
            />
            <Route path="/listings" exact component={() => <Listings 
              account={this.state.account}
              property={this.state.property} 
              offers={this.state.offers} 
              escrows={this.state.escrows}
              //loans={this.state.loans}
              //loanOffers={this.state.loanOffers}
              //loanEscrows={this.state.loanEscrows} 
              ethToDollars={100000}
              makeOffer={this.makeOffer} />} 
            />
            <Route path="/buy" exact component={() => <Buy
              account={this.state.account}
              property={this.state.property} 
              offers={this.state.offers} 
              escrows={this.state.escrows} 
              //loans={this.state.loans}
              //loanOffers={this.state.loanOffers}
              //loanEscrows={this.state.loanEscrows} 
              ethToDollars={100000}
              cancelOffer={this.cancelOffer}
              purchaseProperty={this.purchaseProperty}
              //applyLoan={this.applyLoan}
               />} 
            />
            <Route path="/sell" exact component={() => <Sell 
              account={this.state.account}
              property={this.state.property} 
              offers={this.state.offers} 
              escrows={this.state.escrows} 
              //loans={this.state.loans}
              //loanOffers={this.state.loanOffers}
              //loanEscrows={this.state.loanEscrows} 
              ethToDollars={100000}
              acceptOffer={this.acceptOffer}
              rejectOffer={this.rejectOffer}
              cancelDeal={this.cancelDeal} />} 
            />
            <Route path="/loans" exact component={() => <LoanPortal 
              account={this.state.account}
              property={this.state.property} 
              offers={this.state.offers} 
              escrows={this.state.escrows} 
              //loans={this.state.loans}
              //loanOffers={this.state.loanOffers}
              //loanEscrows={this.state.loanEscrows} 
              ethToDollars={100000}
              acceptOffer={this.acceptOffer}
              rejectOffer={this.rejectOffer}
              cancelDeal={this.cancelDeal}
              //cancelLoan={this.cancelLoan}
              //offerLoan={this.offerLoan}
              //acceptLoan={this.acceptLoan}
              //disburseLoan={this.disburseLoan}
              //rejectLoan={this.rejectLoan}
              //payMortgage={this.payMortgage}
               />} 
            />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
