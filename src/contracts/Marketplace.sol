pragma solidity ^0.5.0;

contract Marketplace {

    address public admin;
    uint public totalPropertyCounter = 0;
    enum State {NONE, AWAITING_PAYMENT, AWAITING_TRANSFER, COMPLETE}
    struct Property {
        uint propID;
        string propTitle;
        string propAddress;
        string propDescription;
        uint propValue;
        address payable propOwner;
        address payable buyer;
        bool pendingSale;
        string imgURL;
    }
    struct Offer {
        uint propID;
        address payable buyer;
        uint amount;
    }
    struct Escrow {
        uint propID;
        address payable propOwner;
        address payable buyer;
        uint amount;
        State currState;
    }
    mapping(uint => Property) public allProperty;
    mapping(uint => Offer[]) public allOffers;
    mapping(uint => uint) public offerCounts;
    mapping(uint => Escrow) public allEscrows;

    event AddedProperty(uint _propID, string _propTitle, string _propAddress, string _propDescription, uint _propValue, address payable _propOwner, address payable _buyer, bool _pendingSale, string _imgURL);
    event CreatedOffer(uint _propID, address payable _buyer, uint _amount);
    event CreatedEscrow(uint _propID, address payable _propOwner, address payable _buyer, uint _amount);
    event PurchasedProperty(uint _propID, address payable _propOwner, uint _amount);

    //Loan Mechanics
    uint public totalLoansCounter = 0;
    enum loanState {NONE, APPLIED, IN_FORCE, COMPLETE}
    enum loanEscrowState {NONE, ACCEPTED, DISBURSED, COMPLETE}
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
    struct LoanOffer {
        uint loanID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
    }
    struct LoanEscrow {
        uint loanID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
        loanEscrowState currState;
    }
    mapping(uint => Loan) public allLoans;
    mapping(uint => LoanOffer[]) public allLoanOffers;
    mapping(uint => LoanEscrow) public allLoanEscrows;
    mapping(uint => uint) public loanOfferCounts;
    //End of Loan Mechanics Set-Up
    
    constructor() public {
       //The admin account is used to deploy the contract.
       admin = msg.sender;
    }

    modifier isAdmin {
        require(msg.sender == admin, "You are not authorised to add property!");
        _;
    }

    modifier isUnique(string memory _propAddress) {
        bool uniq = true;
        if(totalPropertyCounter > 0) {
            for(uint i=1; i<=totalPropertyCounter; i++) {
                if (keccak256(abi.encodePacked(allProperty[i].propAddress)) == keccak256(abi.encodePacked(_propAddress))) {
                    uniq = false;
                    break;
                }
            }
        }
        require(uniq == true, "That address already exists!");
        _;
    }

    modifier isOwner(uint _propID) {
        require(allProperty[_propID].propOwner == msg.sender, "You are not the owner!");
        _;
    }

    modifier checkPayment(uint _propID) {
        require(_propID > 0 && _propID <= totalPropertyCounter, "Property ID is invalid");
        require(allProperty[_propID].buyer == msg.sender, "You are not the buyer!");
        require(allEscrows[_propID].currState == State.AWAITING_PAYMENT, "Payment already made!");
        _;
    }

    function addProperty(string memory _propTitle, string memory _propAddress, string memory _propDescription, uint _propValue, string memory _imgURL) public isUnique(_propAddress) returns (uint) {
        require(bytes(_propAddress).length > 0);
        require(_propValue > 0);
        totalPropertyCounter = totalPropertyCounter + 1;
        Property memory myProperty = Property({
            propID: totalPropertyCounter,
            propTitle: _propTitle,
            propAddress: _propAddress,
            propDescription: _propDescription,
            propValue: _propValue,
            propOwner: msg.sender,
            buyer: msg.sender,
            pendingSale: true,
            imgURL: _imgURL
        });
        allProperty[totalPropertyCounter] = myProperty;
        emit AddedProperty(totalPropertyCounter, _propTitle, _propAddress, _propDescription, _propValue, msg.sender, msg.sender, true, _imgURL);
        //Create null escrow entry in escrow list for this property
        Escrow memory nullEscrow = Escrow({
            propID: totalPropertyCounter,
            propOwner: msg.sender,
            buyer: msg.sender,
            amount: 0,
            currState: State.NONE
        });
        allEscrows[totalPropertyCounter] = nullEscrow;
        offerCounts[totalPropertyCounter] = 0;
    }

    function editProperty(uint _propID, string memory _propTitle, string memory _propDescription, uint _propValue, bool _pendingSale, string memory _imgURL) public isOwner(_propID) {
        require(allEscrows[_propID].currState == State.NONE || allEscrows[_propID].currState == State.COMPLETE);
        allProperty[_propID].propTitle = _propTitle;
        allProperty[_propID].propDescription = _propDescription;
        allProperty[_propID].propValue = _propValue;
        allProperty[_propID].imgURL = _imgURL;
        if (allProperty[_propID].pendingSale != _pendingSale) {
            allProperty[_propID].pendingSale = _pendingSale;
            if (_pendingSale == true) {
                allEscrows[_propID].propOwner = msg.sender;
                allEscrows[_propID].amount = _propValue;
                allEscrows[_propID].currState = State.NONE;
            } else {
                allEscrows[_propID].currState = State.COMPLETE;
            }
        }
    }
    
    function getPropertyDetails(uint _propID) public view returns (uint, string memory, string memory, string memory, uint, bool, string memory) {
        return (allProperty[_propID].propID,
            allProperty[_propID].propTitle, 
            allProperty[_propID].propAddress,
            allProperty[_propID].propDescription, 
            allProperty[_propID].propValue, 
            allProperty[_propID].pendingSale,
            allProperty[_propID].imgURL);
    }

    function getOwnersPropertyCount() public view returns (uint) {
        uint propCount = 0;
        for(uint i=1; i<=totalPropertyCounter; i++) {
            if(allProperty[i].propOwner == msg.sender) {
                propCount++;
            }
        }
        return propCount;
    }

    function makeOffer(uint _propID, uint _amount) public {
        require(allProperty[_propID].pendingSale == true, "That property is not for sale. Please edit it's status.");
        require(msg.sender != allProperty[_propID].propOwner, 'You are the property owner!');
        require(_amount > 0, 'Enter a valid offer value!');
        Offer memory myOffer = Offer({
            propID: _propID,
            buyer: msg.sender,
            amount: _amount
        });
        allOffers[_propID].push(myOffer);
        offerCounts[_propID]++;
        emit CreatedOffer(_propID, msg.sender, _amount);
    }

    function acceptOffer(uint _propID, address payable _buyer) public isOwner(_propID) {
        require(allEscrows[_propID].currState == State.NONE);
        require(_buyer != msg.sender, "You cannot accept your own offer!");
        uint index;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == _buyer) {
                index = i;
                break;
            }
        }
        Offer memory acceptedOffer = allOffers[_propID][index];
        allProperty[_propID].buyer = _buyer; //Change the buyer entry on the property listing.
        //Create escrow
        Escrow memory myEscrow = Escrow({
            propID: _propID,
            propOwner: msg.sender,
            buyer: _buyer,
            amount: acceptedOffer.amount,
            currState: State.AWAITING_PAYMENT
        });
        allEscrows[_propID] = myEscrow;
        emit CreatedEscrow(_propID, msg.sender, _buyer, acceptedOffer.amount); 
    }

    //For the seller to reject offers.
    function rejectOffer(uint _propID, address payable _buyer) public isOwner(_propID) {
        require(allEscrows[_propID].buyer != _buyer);
        uint index;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == _buyer) {
                index = i;
                break;
            }
        }
        //Remove offer
        allOffers[_propID][index] = allOffers[_propID][(allOffers[_propID].length-1)];
        allOffers[_propID].length--;
        offerCounts[_propID]--;
    }

    //For the buyer to back out of offers, even if they have been accepted by seller. Must be before payment. Resets existing escrow if reqd.
    function cancelOffer(uint _propID) public {
        require(allEscrows[_propID].currState == State.NONE || allEscrows[_propID].currState == State.AWAITING_PAYMENT);
        uint index;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == msg.sender) {
                index = i;
                break;
            }
        }
        //Remove offer
        allOffers[_propID][index] = allOffers[_propID][(allOffers[_propID].length-1)];
        allOffers[_propID].length--;
        offerCounts[_propID]--;
        //If buyer is cancelling an offer that has already been accepted by a seller.
        if (allEscrows[_propID].currState == State.AWAITING_PAYMENT && allEscrows[_propID].buyer == msg.sender) {
            //Set the buyer entry on the property listing to the original owner.
            allProperty[_propID].buyer = allProperty[_propID].propOwner;
            //Remove escrow.
            Escrow memory resetEscrow = Escrow({
                propID: _propID,
                propOwner: allProperty[_propID].propOwner,
                buyer: allProperty[_propID].propOwner,
                amount: 0,
                currState: State.NONE
            });
            allEscrows[_propID] = resetEscrow;
        }
    }

    //For the seller to back out of escrows before payment. Will not remove the related offer.
    function cancelEscrow(uint _propID) public isOwner(_propID) {
        require(allEscrows[_propID].currState == State.AWAITING_PAYMENT);
        //Set the buyer entry on the property listing to the original owner.
        allProperty[_propID].buyer = allProperty[_propID].propOwner;
        //Remove escrow.
        Escrow memory resetEscrow = Escrow({
            propID: _propID,
            propOwner: allProperty[_propID].propOwner,
            buyer: allProperty[_propID].propOwner,
            amount: 0,
            currState: State.NONE
        });
        allEscrows[_propID] = resetEscrow;
    }

    function purchaseProperty(uint _propID) public payable checkPayment(_propID) {
        require(msg.value == allEscrows[_propID].amount, "Incorrect payment amount!");
        //make payment
        address payable _propOwner = allProperty[_propID].propOwner;
        _propOwner.transfer(msg.value);
        allEscrows[_propID].currState = State.AWAITING_TRANSFER;
        
        //transfer property
        require(allEscrows[_propID].currState == State.AWAITING_TRANSFER);
        address payable _buyer = allProperty[_propID].buyer;

        Property memory _tempProperty = allProperty[_propID];
        _tempProperty.propOwner = _buyer;
        _tempProperty.propValue = allEscrows[_propID].amount;
        _tempProperty.buyer = _buyer;
        _tempProperty.pendingSale = false;

        allProperty[_propID] = _tempProperty;
        allEscrows[_propID].currState = State.COMPLETE; //Change state on escrow

        //Set loan escrow status if required
        for(uint j=0; j<totalLoansCounter; j++) {
            if(allLoans[j].propID == _propID) {
                allLoanEscrows[j].currState = loanEscrowState.COMPLETE;
            }
        }

        //Remove all offers on the property
        for(uint i=0; i<allOffers[_propID].length; i++) {
            allOffers[_propID].length--;
        }
        offerCounts[_propID] = 0;
        emit PurchasedProperty(_propID, _buyer, msg.value);
    }

    //For loan mechanics
    function applyLoan(uint _propID, uint _amount, uint _duration) public {
        if(allEscrows[_propID].currState == State.AWAITING_PAYMENT && allEscrows[_propID].buyer == msg.sender) {
            totalLoansCounter = totalLoansCounter + 1;
            Loan memory myLoan = Loan({
                loanID: totalLoansCounter,
                propID: _propID,
                buyer: msg.sender,
                provider: msg.sender,
                amount: _amount,
                duration: _duration,
                balamount: allEscrows[_propID].amount,
                balduration: _duration,
                currState: loanState.APPLIED
            });
            allLoans[totalLoansCounter] = myLoan;

            LoanEscrow memory nullLoanEscrow = LoanEscrow({
                loanID: totalLoansCounter,
                buyer: msg.sender,
                provider: msg.sender,
                amount: 0,
                duration: 0,
                currState: loanEscrowState.NONE
            });
            allLoanEscrows[totalLoansCounter] = nullLoanEscrow;
            loanOfferCounts[totalLoansCounter] = 0;
        }
    }

    function cancelLoan(uint _loanID) public {
        allLoans[_loanID].currState = loanState.NONE;
    }

    function offerLoan(uint _loanID) public {
        require(allLoans[_loanID].currState == loanState.APPLIED);
        require(allLoans[_loanID].buyer != msg.sender);
        LoanOffer memory myLoanOffer = LoanOffer({
            loanID: _loanID,
            buyer: allLoans[_loanID].buyer,
            provider: msg.sender,
            amount: allLoans[_loanID].amount,
            duration: allLoans[_loanID].duration
        });
        allLoanOffers[_loanID].push(myLoanOffer);
        loanOfferCounts[_loanID]++;
    }

    function acceptLoan(uint _loanID, address payable _provider) public {
        uint index;
        for(uint i=0; i<loanOfferCounts[_loanID]; i++) {
            if(allLoanOffers[_loanID][i].provider == _provider) {
                index = i;
                break;
            }
        }
        LoanEscrow memory myLoanEscrow = LoanEscrow({
            loanID: _loanID,
            buyer: msg.sender,
            provider: _provider,
            amount: allLoanOffers[_loanID][index].amount,
            duration: allLoanOffers[_loanID][index].duration,
            currState: loanEscrowState.ACCEPTED
        });
        allLoanEscrows[_loanID] = myLoanEscrow;
    }

    function disburseLoan(uint _loanID) public payable {
        require(allLoanEscrows[_loanID].provider == msg.sender);
        address payable _buyer = allLoanEscrows[_loanID].buyer;
        _buyer.transfer(msg.value);
        allLoanEscrows[_loanID].currState = loanEscrowState.DISBURSED;
        
        Loan memory myLoan = Loan({
            loanID: _loanID,
            propID: allLoans[_loanID].propID,
            buyer: allLoans[_loanID].buyer,
            provider: msg.sender,
            amount: allLoanEscrows[_loanID].amount,
            duration: allLoanEscrows[_loanID].duration,
            balamount: allLoanEscrows[_loanID].amount,
            balduration: allLoanEscrows[_loanID].duration,
            currState: loanState.IN_FORCE
        });
        allLoans[_loanID] = myLoan;
        
        //clean up arrays
        for(uint i=0; i<loanOfferCounts[_loanID]; i++) {
            allLoanOffers[_loanID].length--;
        }
        loanOfferCounts[_loanID] = 0;  
    }

    function rejectLoan(uint _loanID) public {
        require(allEscrows[allLoans[_loanID].propID].propOwner != msg.sender);
        require(allEscrows[allLoans[_loanID].propID].currState == State.AWAITING_PAYMENT);
        address payable _provider = allLoans[_loanID].provider;
        _provider.transfer(allLoans[_loanID].amount);
        allLoanEscrows[_loanID].currState = loanEscrowState.NONE;
        allLoans[_loanID].currState = loanState.APPLIED;
    }

    function payMortgage(uint _loanID) public payable {
        require(allLoans[_loanID].buyer == msg.sender);
        address payable _provider = allLoans[_loanID].provider;
        _provider.transfer(msg.value);

        allLoans[_loanID].balamount = allLoans[_loanID].balamount - msg.value;
        allLoans[_loanID].balduration--;
        if (allLoans[_loanID].balamount == 0) {
            allLoans[_loanID].currState = loanState.COMPLETE;
        }
    }

}