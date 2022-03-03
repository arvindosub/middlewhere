import React, { Component } from "react";
import Web3 from 'web3';
import './App.css';
import MWToken from './abis/MWToken.json';
import Props from './abis/Props.json';
import Loans from './abis/Loans.json';
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
    // Load MWToken
    const mwtData = MWToken.networks[networkId]
    if (mwtData) {
      const mwToken = new web3.eth.Contract(MWToken.abi, mwtData.address)
      this.setState({ mwToken })

      // Load Property
      const propsData = Props.networks[networkId]
      if (propsData) {
        const mwProps = new web3.eth.Contract(Props.abi, propsData.address)
        this.setState({ mwProps })

        // Load Loans
        const loansData = Loans.networks[networkId]
        if (loansData) {
          const mwLoans = new web3.eth.Contract(Loans.abi, loansData.address)
          this.setState({ mwLoans })

          // Load Marketplace
          const marketData = Marketplace.networks[networkId]
          if (marketData) {
            const mwMarket = new web3.eth.Contract(Marketplace.abi, marketData.address)
            this.setState({ mwMarket })

            // ALL CONTRACTS LOADED SUCCESSFULLY

            //load mw token balance
            let balance = await mwToken.methods.checkBal(this.state.account).call()
            this.setState({ tokenBalance: balance })
            console.log('Token Balance')
            console.log(this.state.tokenBalance)

            //load all property
            const propertyCount = await mwProps.methods.totalPropertyCounter().call()
            this.setState({ propertyCount })
            for (var i=1; i<=propertyCount; i++) {
              const property = await mwProps.methods.allProperty(i).call()
              this.setState({ property: [...this.state.property, property] })
            }
            console.log('All Property')
            console.log(this.state.property)

            //load all property escrows
            for (var j=1; j<=propertyCount; j++) {
              const pescrowCount = await mwProps.methods.countPropEscrows(j).call()
              for (var k=0; k<pescrowCount; k++) {
                const pescrow = await mwProps.methods.allPropEscrows(j,k).call()
                this.setState({ pescrows: [...this.state.pescrows, pescrow] })
              }
            }
            console.log('All Property Escrows')
            console.log(this.state.pescrows)

            //load all property offers
            for (var a=1; a <= propertyCount; a++) {
              var pofferCount = await mwMarket.methods.countPropOffers(a).call()
              for (var b=0; b<pofferCount; b++) {
                const poffer = await mwMarket.methods.allPropOffers(a,b).call()
                this.setState({ poffers: [...this.state.poffers, poffer] })
              }
            }
            console.log('All Property Offers')
            console.log(this.state.poffers)

            //load all loans
            const loansCount = await mwLoans.methods.totalLoansCounter().call()
            this.setState({ loansCount })
            for (var s=1; s <= loansCount; s++) {
              const loan = await mwLoans.methods.allLoans(s).call()
              this.setState({ loans: [...this.state.loans, loan] })
            }
            console.log('All Loans')
            console.log(this.state.loans)

            //load all loan escrows
            for (var n=1; n <= loansCount; n++) {
              const lescrow = await mwLoans.methods.allLoanEscrows(n).call()
              this.setState({ lescrows: [...this.state.lescrows, lescrow] })
            }
            console.log('All Loan Escrows')
            console.log(this.state.lescrows)

            //load all loan offers
            for (var l=1; l <= loansCount; l++) {
              var lofferCount = await mwMarket.methods.countLoanOffers(l).call()
              for (var m=0; m < lofferCount; m++) {
                const loffer = await mwMarket.methods.allLoanOffers(l,m).call()
                this.setState({ loffers: [...this.state.loffers, loffer] })
              }
            }
            console.log('All Loan Offers')
            console.log(this.state.loffers)

            this.setState({ loading: false })

          } else {
            window.alert('Marketplace contract not deployed to detected network.')
          }

        } else {
          window.alert('Loans contract not deployed to detected network.')
        }

      } else {
        window.alert('Props contract not deployed to detected network.')
      }

    } else {
      window.alert('MWToken contract not deployed to detected network.')
    }
  
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      tokenBalance: 0,
      propertyCount: 0,
      property: [],
      pescrows: [],
      poffers: [],
      loansCount: 0,
      loans: [],
      lescrows: [],
      loffers: [],
      loading: true
    }
    this.topupTokens = this.topupTokens.bind(this)
    this.addProperty = this.addProperty.bind(this)
    this.editProperty = this.editProperty.bind(this)
    this.makeOffer = this.makeOffer.bind(this)
    this.acceptOffer = this.acceptOffer.bind(this)
    this.rejectOffer = this.rejectOffer.bind(this)
    this.cancelOffer = this.cancelOffer.bind(this)
    this.cancelDeal = this.cancelDeal.bind(this)
    this.purchaseProperty = this.purchaseProperty.bind(this)
    this.createLoan = this.createLoan.bind(this)
    this.applyLoan = this.applyLoan.bind(this)
    this.cancelLoan = this.cancelLoan.bind(this)
    this.offerLoan = this.offerLoan.bind(this)
    this.acceptLoan = this.acceptLoan.bind(this)
    this.disburseLoan = this.disburseLoan.bind(this)
    this.refuseLoan = this.refuseLoan.bind(this)
    this.denyLoan = this.denyLoan.bind(this)
    this.payMortgage = this.payMortgage.bind(this)
    this.payBalance = this.payBalance.bind(this)
  }

  topupTokens(ethValue) {
    this.setState({ loading: true })
    this.state.mwToken.methods.getCredit().send({ from: this.state.account, value: window.web3.utils.toWei(ethValue.toString(), 'Ether') }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  addProperty(propTitle, propAddress, propDescription, percentage, value, imgURL) {
    this.setState({ loading: true })
    this.state.mwProps.methods.addProperty(propTitle, propAddress, propDescription, percentage, value, imgURL).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  editProperty(propID, propTitle, propDescription, value, salePercent, imgURL) {
    this.setState({ loading: true })
    this.state.mwProps.methods.editProperty(propID, propTitle, propDescription, value, salePercent, imgURL).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  makeOffer(propID, amount, stakeOwner) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.makeOffer(propID, amount, stakeOwner).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  acceptOffer(propID, buyer) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.acceptOffer(propID, buyer).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  rejectOffer(propID, buyer) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.rejectOffer(propID, buyer).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelOffer(propID, stakeOwner) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.cancelOffer(propID, stakeOwner).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelDeal(propID) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.cancelDeal(propID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  purchaseProperty(propID, buyer) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.purchaseProperty(propID, buyer).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  createLoan(propID, amount, duration) {
    this.setState({ loading: true })
    this.state.mwLoans.methods.createLoan(propID, amount, duration).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  applyLoan(loanID) {
    this.setState({ loading: true })
    this.state.mwLoans.methods.applyLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  cancelLoan(loanID) {
    this.setState({ loading: true })
    this.state.mwLoans.methods.cancelLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  offerLoan(loanID) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.offerLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  acceptLoan(loanID, provider) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.acceptLoan(loanID, provider).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  disburseLoan(loanID) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.disburseLoan(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  // for buyers to reject offers
  refuseLoan(loanID, provider) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.refuseLoan(loanID, provider).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  // for sellers to pull out even after offer is accepted
  denyLoan(loanID, provider) {
    this.setState({ loading: true })
    this.state.mwMarket.methods.denyLoan(loanID, provider).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  payMortgage(loanID) {
    this.setState({ loading: true })
    this.state.mwLoans.methods.payMortgage(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

  payBalance(loanID) {
    this.setState({ loading: true })
    this.state.mwLoans.methods.payBalance(loanID).send({ from: this.state.account }).once('receipt', (receipt) => {
      this.setState({ loading: false })
      window.location.reload()
    })
  }

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
              pescrows={this.state.pescrows}
              poffers={this.state.poffers} 
              loans={this.state.loans}
              lescrows={this.state.lescrows}
              loffers={this.state.loffers}
              addProperty={this.addProperty}
              editProperty={this.editProperty}
              topupTokens={this.topupTokens} />}
            />
            <Route path="/listings" exact component={() => <Listings 
              account={this.state.account}
              property={this.state.property} 
              poffers={this.state.poffers} 
              pescrows={this.state.pescrows}
              loans={this.state.loans}
              loffers={this.state.loffers}
              lescrows={this.state.lescrows}
              makeOffer={this.makeOffer}
              topupTokens={this.topupTokens} />} 
            />
            <Route path="/buy" exact component={() => <Buy
              account={this.state.account}
              property={this.state.property} 
              poffers={this.state.poffers} 
              pescrows={this.state.pescrows} 
              loans={this.state.loans}
              loffers={this.state.loffers}
              lescrows={this.state.lescrows}
              cancelOffer={this.cancelOffer}
              purchaseProperty={this.purchaseProperty}
              createLoan={this.createLoan}
              applyLoan={this.applyLoan}
              cancelLoan={this.cancelLoan}
              topupTokens={this.topupTokens} />} 
            />
            <Route path="/sell" exact component={() => <Sell 
              account={this.state.account}
              property={this.state.property} 
              poffers={this.state.poffers} 
              pescrows={this.state.pescrows} 
              loans={this.state.loans}
              loffers={this.state.loffers}
              lescrows={this.state.lescrows}
              acceptOffer={this.acceptOffer}
              rejectOffer={this.rejectOffer}
              cancelDeal={this.cancelDeal}
              topupTokens={this.topupTokens} />} 
            />
            <Route path="/loans" exact component={() => <LoanPortal 
              account={this.state.account}
              property={this.state.property} 
              poffers={this.state.poffers} 
              pescrows={this.state.pescrows} 
              loans={this.state.loans}
              loffers={this.state.loffers}
              lescrows={this.state.lescrows}
              acceptOffer={this.acceptOffer}
              rejectOffer={this.rejectOffer}
              cancelDeal={this.cancelDeal}
              cancelLoan={this.cancelLoan}
              offerLoan={this.offerLoan}
              acceptLoan={this.acceptLoan}
              disburseLoan={this.disburseLoan}
              refuseLoan={this.refuseLoan}
              denyLoan={this.denyLoan}
              payMortgage={this.payMortgage}
              payBalance={this.payBalance}
              topupTokens={this.topupTokens} />} 
            />
          </Switch>
          <Footer />
        </Router>
      </div>
    );
  }
}

export default App;
