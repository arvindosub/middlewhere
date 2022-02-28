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
        string imgURL;
        uint accounted;
    }
    struct Escrow {
        uint propID;
        uint percentage;
        uint value;
        uint amount;
        address payable stakeOwner;
        address payable buyer;
        uint salePercent;
        State currState;
    }
    struct Offer {
        uint propID;
        uint percentage;
        uint amount;
        address payable stakeOwner;
        address payable buyer;
        State currState;
    }
    mapping(uint => Property) public allProperty;
    mapping(uint => Offer[]) public allOffers;
    mapping(uint => uint) public offerCounts;
    mapping(uint => Escrow[]) public allEscrows;
    mapping(uint => uint) public escrowCounts;

    event CreatedProperty(uint _propID, string _propTitle, string _propAddress, string _propDescription, string _imgURL, uint _accounted);
    event CreatedEscrow(uint _propID, uint _percentage, uint _value, uint _amount, address payable _propOwner, address payable _buyer, uint _salePercent, State _currState);
    event CreatedOffer(uint _propID, uint _percentage, uint _amount, address payable _stakeOwner, address payable _buyer, State _currState);
    event PurchasedStake(uint _propID, uint _percentage, uint _amount, address payable _stakeOwner);
    
    constructor() public {
       //The admin account is used to deploy the contract.
       admin = msg.sender;
    }

    modifier isAdmin {
        require(msg.sender == admin, "You are not authorised to add property!");
        _;
    }

    modifier checkPayment(uint _propID) {
        uint index;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == msg.sender) {
                index = i;
                break;
            }
        }
        require(_propID > 0 && _propID <= totalPropertyCounter, "Property ID is invalid");
        require(allEscrows[_propID][index].buyer == msg.sender, "You are not the buyer!");
        require(allEscrows[_propID][index].currState == State.AWAITING_PAYMENT, "Payment already made!");
        _;
    }

    function addEscrow(uint _propID, uint _percentage, uint _value) public {
        Escrow memory nullEscrow = Escrow({
            propID: _propID,
            percentage: _percentage,
            value: _value,
            amount: _value,
            stakeOwner: msg.sender,
            buyer: msg.sender,
            salePercent: 0,
            currState: State.NONE
        });
        allEscrows[_propID].push(nullEscrow);
        escrowCounts[_propID]++;
        emit CreatedEscrow(_propID, _percentage, _value, _value, msg.sender, msg.sender, 0, State.NONE);
    }

    function addProperty(string memory _propTitle, string memory _propAddress, string memory _propDescription, uint _percentage, uint _value, string memory _imgURL) public {
        require(bytes(_propAddress).length > 0);

        // Check if unique property and/or all owners are registered
        bool isUnique = true;
        uint percentAcc = 0;
        uint propID = 0;
        if(totalPropertyCounter > 0) {
            for(uint i=1; i<=totalPropertyCounter; i++) {
                if (keccak256(abi.encodePacked(allProperty[i].propAddress)) == keccak256(abi.encodePacked(_propAddress))) {
                    isUnique = false;
                    propID = i;
                    percentAcc = allProperty[i].accounted + _percentage;
                    if (allProperty[i].accounted == 100) {
                        revert("This property is already registered and fully accounted for!");
                    } else if (percentAcc > 100) {
                        revert("Stake size claimed is too large!");
                    }
                    break;
                }
            }
        }
        // Create new property if unique
        if (isUnique == true) {
            require(_value > 0);
            totalPropertyCounter = totalPropertyCounter + 1;
            escrowCounts[totalPropertyCounter] = 0;
            offerCounts[totalPropertyCounter] = 0;
            
            Property memory myProperty = Property({
                propID: totalPropertyCounter,
                propTitle: _propTitle,
                propAddress: _propAddress,
                propDescription: _propDescription,
                imgURL: _imgURL,
                accounted: _percentage
            });

            allProperty[totalPropertyCounter] = myProperty;
            emit CreatedProperty(totalPropertyCounter, _propTitle, _propAddress, _propDescription, _imgURL, _percentage);
            // Add stake for person first adding the property
            addEscrow(totalPropertyCounter, _percentage, _value);

        } else {
            // Only need to add new stake owner as property already exists. Need to update accounted percentage of property.
            addEscrow(propID, _percentage, _value);
            allProperty[propID].accounted = percentAcc;
        }
    }

    function editProperty(uint _propID, string memory _propTitle, string memory _propDescription, uint _value, uint _salePercent, string memory _imgURL) public {
        uint index;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == msg.sender) {
                index = i;
                break;
            }
        }
        require(index >= 0, "You are not the owner!");
        Escrow memory myEscrow = allEscrows[_propID][index];
        require(myEscrow.currState == State.NONE || myEscrow.currState == State.COMPLETE, "There is an ongoing transaction!");

        allProperty[_propID].propTitle = _propTitle;
        allProperty[_propID].propDescription = _propDescription;
        allProperty[_propID].imgURL = _imgURL;
        myEscrow.value = _value;
        if (myEscrow.salePercent != _salePercent) {
            myEscrow.salePercent = _salePercent;
            if (_salePercent > 0) {
                myEscrow.currState = State.NONE;
            } else {
                myEscrow.currState = State.COMPLETE;
            }
        }
        allEscrows[_propID][index] = myEscrow;
    }
    
    function getPropertyDetails(uint _propID) public view returns (uint, string memory, string memory, string memory, string memory) {
        return (allProperty[_propID].propID,
            allProperty[_propID].propTitle, 
            allProperty[_propID].propAddress,
            allProperty[_propID].propDescription,
            allProperty[_propID].imgURL);
    }

    function getOwnersPropertyCount() public view returns (uint) {
        uint propCount = 0;
        for(uint i=1; i<=totalPropertyCounter; i++) {
            for(uint j=0; j<allEscrows[i].length; j++) {
                if(allEscrows[i][j].stakeOwner == msg.sender) {
                    propCount++;
                    break;
                }
            }
        }
        return propCount;
    }

    function makeOffer(uint _propID, uint _amount, address payable _stakeOwner) public {
        uint index;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == _stakeOwner) {
                index = i;
                break;
            }
        }
        Escrow memory myEscrow = allEscrows[_propID][index];
        require(myEscrow.salePercent > 0, "That property is not for sale. Please edit it's status.");
        require(msg.sender != myEscrow.stakeOwner, 'You are the property owner!');
        require(_amount > 0, 'Enter a valid offer value!');

        uint _percentage = myEscrow.salePercent;

        Offer memory myOffer = Offer({
            propID: _propID,
            percentage: _percentage,
            amount: _amount,
            stakeOwner: _stakeOwner,
            buyer: msg.sender,
            currState: State.NONE
        });
        allOffers[_propID].push(myOffer);
        offerCounts[_propID]++;
        emit CreatedOffer(_propID, _percentage, _amount, _stakeOwner, msg.sender, State.NONE);
    }

    function acceptOffer(uint _propID, address payable _buyer) public {
        uint indexE;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == msg.sender) {
                indexE = i;
                break;
            }
        }
        require(indexE >= 0, "You are not the owner!");
        Escrow memory myEscrow = allEscrows[_propID][indexE];
        require(myEscrow.currState == State.NONE);
        require(_buyer != msg.sender, "You cannot accept your own offer!");
        uint indexO;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == _buyer) {
                indexO = i;
                break;
            }
        }
        // Update offer status
        allOffers[_propID][indexO].currState = State.AWAITING_PAYMENT;
        Offer memory acceptedOffer = allOffers[_propID][indexO];
        // Update escrow
        myEscrow.buyer = _buyer;
        myEscrow.amount = acceptedOffer.amount;
        myEscrow.currState = State.AWAITING_PAYMENT;
        allEscrows[_propID][indexE] = myEscrow;
    }

    //For the seller to reject offers.
    function rejectOffer(uint _propID, address payable _buyer) public {
        uint indexE;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == msg.sender) {
                indexE = i;
                break;
            }
        }
        require(indexE >= 0, "You are not the owner!");
        require(allEscrows[_propID][indexE].buyer != _buyer, "Already accepted this offer!");
        uint indexO;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == _buyer) {
                indexO = i;
                break;
            }
        }
        //Remove offer
        allOffers[_propID][indexO] = allOffers[_propID][(allOffers[_propID].length-1)];
        allOffers[_propID].length--;
        offerCounts[_propID]--;
    }

    //For the buyer to back out of offers, even if they have been accepted by seller. Must be before payment. Resets escrow.
    function cancelOffer(uint _propID, address payable _stakeOwner) public {
        uint indexE;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == _stakeOwner) {
                indexE = i;
                break;
            }
        }
        Escrow memory myEscrow = allEscrows[_propID][indexE];
        require(allEscrows[_propID][indexE].currState == State.NONE || allEscrows[_propID][indexE].currState == State.AWAITING_PAYMENT);
        uint indexO;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].buyer == msg.sender) {
                indexO = i;
                break;
            }
        }
        //Remove offer
        allOffers[_propID][indexO] = allOffers[_propID][(allOffers[_propID].length-1)];
        allOffers[_propID].length--;
        offerCounts[_propID]--;
        //If buyer is cancelling an offer that has already been accepted by a seller.
        if (myEscrow.currState == State.AWAITING_PAYMENT && myEscrow.buyer == msg.sender) {
            //Reset the fields in the escrow.
            myEscrow.buyer = myEscrow.stakeOwner;
            myEscrow.amount = myEscrow.value * (myEscrow.salePercent/100);
            myEscrow.currState = State.NONE;
            allEscrows[_propID][indexE] = myEscrow;
        }
    }

    //For the seller to back out of offers before payment. Will not remove the related offer.
    function cancelDeal(uint _propID) public {
        uint indexE;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].stakeOwner == msg.sender) {
                indexE = i;
                break;
            }
        }
        uint indexO;
        for(uint i=0; i<allOffers[_propID].length; i++) {
            if(allOffers[_propID][i].stakeOwner == msg.sender) {
                indexO = i;
                break;
            }
        }
        require(indexE >= 0, "You are not the owner!");
        Escrow memory myEscrow = allEscrows[_propID][indexE];
        require(myEscrow.currState == State.AWAITING_PAYMENT);
        // Reset offer status
        allOffers[_propID][indexO].currState = State.NONE;
        // Reset the fields in the escrow.
        myEscrow.buyer = myEscrow.stakeOwner;
        myEscrow.amount = myEscrow.value * (myEscrow.salePercent/100);
        myEscrow.currState = State.NONE;
        allEscrows[_propID][indexE] = myEscrow;
    }

    function purchaseProperty(uint _propID) public payable checkPayment(_propID) {
        uint indexE;
        for(uint i=0; i<allEscrows[_propID].length; i++) {
            if(allEscrows[_propID][i].buyer == msg.sender) {
                indexE = i;
                break;
            }
        }
        Escrow memory myEscrow = allEscrows[_propID][indexE];
        require(msg.value == myEscrow.amount, "Incorrect payment amount!");
        //make payment
        address payable _stakeOwner = myEscrow.stakeOwner;
        address payable _buyer = myEscrow.buyer;
        _stakeOwner.transfer(msg.value);
        myEscrow.currState = State.AWAITING_TRANSFER;

        //transfer property by updating escrow
        require(myEscrow.currState == State.AWAITING_TRANSFER);
        // if 100% transfer, just change existing escrow. else, modify existing escrow and create new one for new stakeholder.
        if (myEscrow.salePercent == 100) {
            myEscrow.stakeOwner = myEscrow.buyer;
            myEscrow.value = myEscrow.amount;
            myEscrow.currState = State.COMPLETE;
            myEscrow.salePercent = 0;
            allEscrows[_propID][indexE] = myEscrow;
        } else {
            addEscrow(_propID, myEscrow.salePercent, myEscrow.amount);
            myEscrow.value = (myEscrow.amount / myEscrow.salePercent) * (myEscrow.percentage - myEscrow.salePercent);
            myEscrow.percentage = myEscrow.percentage - myEscrow.salePercent;
            myEscrow.currState = State.COMPLETE;
            myEscrow.salePercent = 0;
            allEscrows[_propID][indexE] = myEscrow;
        }
        
        //Set loan escrow status if required
        //for(uint j=0; j<totalLoansCounter; j++) {
        //    if(allLoans[j].propID == _propID) {
        //        allLoanEscrows[j].currState = loanEscrowState.COMPLETE;
        //    }
        //}

        //Remove all offers on the property
        for(uint i=0; i<allOffers[_propID].length; i++) {
            allOffers[_propID].length--;
        }
        offerCounts[_propID] = 0;
        emit PurchasedStake(_propID, allEscrows[_propID][indexE].percentage, msg.value, _buyer);
    }
}