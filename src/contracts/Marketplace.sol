pragma solidity ^0.5.0;
import "./Props.sol";
import "./Loans.sol";

contract Marketplace {

    Props propsContract;
    Loans loansContract;
    uint256 commissionFee;
    address _owner = msg.sender;
    enum PropEscrowState {NONE, AWAITING_PAYMENT, AWAITING_TRANSFER, COMPLETE}
    struct PropEscrow {
        uint propID;
        uint percentage;
        uint value;
        uint amount;
        address payable stakeOwner;
        address payable buyer;
        uint salePercent;
        PropEscrowState currState;
    }
    enum PropOfferState {NONE, IN_PROCESS}
    struct PropOffer {
        uint propID;
        uint percentage;
        uint amount;
        address payable stakeOwner;
        address payable buyer;
        PropOfferState currState;
    }
    
    enum loanState {NONE, APPLIED, IN_FORCE, COMPLETE}
    struct Loan {
        uint loanID;
        uint propID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
        uint balamount;
        uint balduration;
        loanState currState;
    }
    enum loanEscrowState {NONE, ACCEPTED, DISBURSED, COMPLETE}
    struct LoanEscrow {
        uint loanID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
        loanEscrowState currState;
    }
    struct LoanOffer {
        uint loanID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
    }

    mapping(uint => PropOffer[]) public allPropOffers;
    mapping(uint => uint) public countPropOffers;
    mapping(uint => LoanOffer[]) public allLoanOffers;
    mapping(uint => uint) public countLoanOffers;

    event CreatedPropOffer(uint _propID, uint _percentage, uint _amount, address payable _stakeOwner, address payable _buyer, PropOfferState _currState);
    event PurchasedStake(uint _propID, uint _percentage, uint _amount, address payable _stakeOwner);

    constructor (Props propsAddress, Loans loansAddress, uint256 fee) public {
        propsContract = propsAddress;
        loansContract = loansAddress;
        commissionFee = fee;
    }

    //For potential buyers to make offers
    function makeOffer(uint _propID, uint _amount, address payable _stakeOwner) public {

        ( , , , , address payable own, , uint sale, ) = propsContract.findPropEscrow(_propID, _stakeOwner);

        require(sale > 0, "That property is not for sale.");
        require(msg.sender != own, 'You are the property owner!');
        require(_amount > 0, 'Enter a valid offer value!');

        PropOffer memory myOffer = PropOffer({
            propID: _propID,
            percentage: sale,
            amount: _amount,
            stakeOwner: _stakeOwner,
            buyer: msg.sender,
            currState: PropOfferState.NONE
        });
        allPropOffers[_propID].push(myOffer);
        countPropOffers[_propID]++;

        emit CreatedPropOffer(_propID, sale, _amount, _stakeOwner, msg.sender, PropOfferState.NONE);
    }

    //For sellers to accept the offer of their choice
    function acceptOffer(uint _propID, address payable _buyer) public {

        ( , , , , , , , uint stat) = propsContract.findPropEscrow(_propID, msg.sender);
        require(stat == 0);
        require(_buyer != msg.sender, "You cannot accept your own offer!");

        uint index;
        for(uint i=0; i<allPropOffers[_propID].length; i++) {
            if(allPropOffers[_propID][i].buyer == _buyer) {
                index = i;
                break;
            }
        }
        PropOffer memory myOffer = allPropOffers[_propID][index];
        // Update offer status
        allPropOffers[_propID][index].currState = PropOfferState.IN_PROCESS;

        // Update escrow
        propsContract.updatePropEscrowStatus(_propID, msg.sender, _buyer, myOffer.amount, 1);
    }

    //For the seller to reject offers.
    function rejectOffer(uint _propID, address payable _buyer) public {

        ( , , , , , address payable buy, , ) = propsContract.findPropEscrow(_propID, msg.sender);
        require(buy != _buyer, "Already accepted this offer!");

        uint index;
        for(uint i=0; i<allPropOffers[_propID].length; i++) {
            if(allPropOffers[_propID][i].buyer == _buyer) {
                index = i;
                break;
            }
        }
        //Remove offer
        allPropOffers[_propID][index] = allPropOffers[_propID][(allPropOffers[_propID].length-1)];
        allPropOffers[_propID].length--;
        countPropOffers[_propID]--;
    }

    //For the buyer to back out of offers, even if they have been accepted by seller. Must be before payment. Resets escrow.
    function cancelOffer(uint _propID, address payable _stakeOwner) public {
        ( , , uint val, , , address payable buy, uint sale, uint stat) = propsContract.findPropEscrow(_propID, _stakeOwner);
        require(stat == 0 || stat == 1);

        uint index;
        for(uint i=0; i<allPropOffers[_propID].length; i++) {
            if(allPropOffers[_propID][i].buyer == msg.sender) {
                index = i;
                break;
            }
        }
        //Remove offer
        allPropOffers[_propID][index] = allPropOffers[_propID][(allPropOffers[_propID].length-1)];
        allPropOffers[_propID].length--;
        countPropOffers[_propID]--;

        //If buyer is cancelling an offer that has already been accepted by a seller.
        if (stat == 1 && buy == msg.sender) {
            //Reset the fields in the escrow.
            propsContract.updatePropEscrowStatus(_propID, _stakeOwner, _stakeOwner, val*(sale/100), 0);
        }
    }

    //For the seller to back out of offers before payment. Will not remove the related offer.
    function cancelDeal(uint _propID) public {
        uint index;
        for(uint i=0; i<allPropOffers[_propID].length; i++) {
            if(allPropOffers[_propID][i].stakeOwner == msg.sender) {
                index = i;
                break;
            }
        }
        ( , , uint val, , , , uint sale, uint stat) = propsContract.findPropEscrow(_propID, msg.sender);
        require(stat == 1);
        // Reset offer status
        allPropOffers[_propID][index].currState = PropOfferState.NONE;
        // Reset the fields in the escrow.
        propsContract.updatePropEscrowStatus(_propID, msg.sender, msg.sender, val*(sale/100), 0);
    }

    //For buyers to complete the sale after their offer is accepted by the seller
    function purchaseProperty(uint _propID) public {
        (, , , uint amt, address payable own, address payable buy, uint sale, ) = propsContract.findPropEscrow(_propID, msg.sender);
        require(propsContract.checkBalance(msg.sender) >= amt, "Insufficient funds!");
        //make payment
        address payable _stakeOwner = own;
        address payable _buyer = buy;
        require(_buyer == msg.sender, "You are not the buyer!");
        propsContract.transferMWT(_buyer, _stakeOwner, amt);
        //transfer property
        propsContract.transferPropEscrow(_propID, _stakeOwner, msg.sender);

        //Set loan escrow status if required
        //for(uint j=0; j<totalLoansCounter; j++) {
        //    if(allLoans[j].propID == _propID) {
        //        allLoanEscrows[j].currState = loanEscrowState.COMPLETE;
        //    }
        //}

        //Remove all offers on the property
        for(uint i=0; i<allPropOffers[_propID].length; i++) {
            allPropOffers[_propID].length--;
        }
        countPropOffers[_propID] = 0;
        emit PurchasedStake(_propID, sale, amt, _buyer);
    }

    //Loans
    //For potential lenders to offer loans based on the requests
    function offerLoan(uint _loanID) public {
        ( , , address payable buyr, , uint amnt, uint durn, , , uint stat) = loansContract.findLoan(_loanID);
        require(stat == 1, "Loan has not been applied for!");
        require(buyr != msg.sender, "You cannot lend to yourself...");
        LoanOffer memory myLoanOffer = LoanOffer({
            loanID: _loanID,
            buyer: buyr,
            provider: msg.sender,
            amount: amnt,
            duration: durn
        });
        allLoanOffers[_loanID].push(myLoanOffer);
        countLoanOffers[_loanID]++;
    }

    //For borrowers to accept the loan of their choice
    function acceptLoan(uint _loanID, address payable _provider) public {
        uint index;
        for(uint i=0; i<countLoanOffers[_loanID]; i++) {
            if(allLoanOffers[_loanID][i].provider == _provider) {
                index = i;
                break;
            }
        }
        loansContract.updateLoanEscrow(_loanID, _provider, allLoanOffers[_loanID][index].amount, allLoanOffers[_loanID][index].duration, 1);
    }

    //For lenders to disburse the funds after the borrower accepts their loan offer
    function disburseLoan(uint _loanID) public payable {
        ( , address payable buyr, address payable prov, uint amnt, uint durn, ) = loansContract.findLoanEscrow(_loanID);
        require(prov == msg.sender, "You are not the lender for this loan!");
        loansContract.transferMWT(prov, buyr, amnt);

        //update loan escrow
        loansContract.updateLoanEscrow(_loanID, prov, amnt, durn, 2);
        
        //update loan
        loansContract.updateLoan(_loanID, prov, 2);
        
        //remove all other loan offers
        for(uint i=0; i<countLoanOffers[_loanID]; i++) {
            allLoanOffers[_loanID].length--;
        }
        countLoanOffers[_loanID] = 0;  
    }

    //For borrowers to reject loan offers
    function refuseLoan(uint _loanID, address payable _provider) public {
        uint index;
        for(uint i=0; i<allLoanOffers[_loanID].length; i++) {
            if(allLoanOffers[_loanID][i].provider == _provider) {
                index = i;
                break;
            }
        }

        allLoanOffers[_loanID][index] = allLoanOffers[_loanID][(allLoanOffers[_loanID].length-1)];
        allLoanOffers[_loanID].length--;
        countLoanOffers[_loanID]--;
    }

    //For lenders to pull out of loan offers after they have been accepted
    function denyLoan(uint _loanID, address payable _provider) public {
        require(_provider == msg.sender, "You are not the lender!");

        uint index;
        for(uint i=0; i<allLoanOffers[_loanID].length; i++) {
            if(allLoanOffers[_loanID][i].provider == _provider) {
                index = i;
                break;
            }
        }

        //update loan escrow
        loansContract.updateLoanEscrow(_loanID, allLoanOffers[_loanID][index].buyer, allLoanOffers[_loanID][index].amount, allLoanOffers[_loanID][index].duration, 0);

        //remove loan offer
        allLoanOffers[_loanID][index] = allLoanOffers[_loanID][(allLoanOffers[_loanID].length-1)];
        allLoanOffers[_loanID].length--;
        countLoanOffers[_loanID]--;
    
    }

}