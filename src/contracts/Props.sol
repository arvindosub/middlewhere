pragma solidity ^0.5.0;
import "./MWToken.sol";

contract Props {

    MWToken mwtContract;

    constructor (MWToken mwtAddress) public {
        mwtContract = mwtAddress;
    }

    uint public totalPropertyCounter = 0;
    enum PropEscrowState {NONE, AWAITING_PAYMENT, AWAITING_TRANSFER, COMPLETE}
    struct Property {
        uint propID;
        string propTitle;
        string propAddress;
        string propDescription;
        string imgURL;
        uint accounted;
    }
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
    mapping(uint => Property) public allProperty;
    mapping(uint => PropEscrow[]) public allPropEscrows;
    mapping(uint => uint) public countPropEscrows;

    event CreatedProperty(uint _propID, string _propTitle, string _propAddress, string _propDescription, string _imgURL, uint _accounted);
    event CreatedPropEscrow(uint _propID, uint _percentage, uint _value, uint _amount, address payable _propOwner, address payable _buyer, uint _salePercent, PropEscrowState _currState);

    function addPropEscrow(uint _propID, uint _percentage, uint _value, address payable _owner, address payable _buyer) public {
        PropEscrow memory nullEscrow = PropEscrow({
            propID: _propID,
            percentage: _percentage,
            value: _value,
            amount: _value,
            stakeOwner: _owner,
            buyer: _buyer,
            salePercent: 0,
            currState: PropEscrowState.NONE
        });
        allPropEscrows[_propID].push(nullEscrow);
        countPropEscrows[_propID]++;
        emit CreatedPropEscrow(_propID, _percentage, _value, _value, _owner, _buyer, 0, PropEscrowState.NONE);
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
            countPropEscrows[totalPropertyCounter] = 0;
            
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
            addPropEscrow(totalPropertyCounter, _percentage, _value, msg.sender, msg.sender);

        } else {
            // Only need to add new stake owner as property already exists. Need to update accounted percentage of property.
            addPropEscrow(propID, _percentage, _value, msg.sender, msg.sender);
            allProperty[propID].accounted = percentAcc;
        }
    }

    function editProperty(uint _propID, string memory _propTitle, string memory _propDescription, uint _value, uint _salePercent, string memory _imgURL) public {
        uint index;
        for(uint i=0; i<allPropEscrows[_propID].length; i++) {
            if(allPropEscrows[_propID][i].stakeOwner == msg.sender) {
                index = i;
                break;
            }
        }
        require(index >= 0, "You are not the owner!");
        PropEscrow memory myEscrow = allPropEscrows[_propID][index];
        require(myEscrow.currState == PropEscrowState.NONE || myEscrow.currState == PropEscrowState.COMPLETE, "There is an ongoing transaction!");

        allProperty[_propID].propTitle = _propTitle;
        allProperty[_propID].propDescription = _propDescription;
        allProperty[_propID].imgURL = _imgURL;
        myEscrow.value = _value;
        if (myEscrow.salePercent != _salePercent) {
            myEscrow.salePercent = _salePercent;
            if (_salePercent > 0) {
                myEscrow.currState = PropEscrowState.NONE;
            } else {
                myEscrow.currState = PropEscrowState.COMPLETE;
            }
        }
        allPropEscrows[_propID][index] = myEscrow;
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
            for(uint j=0; j<allPropEscrows[i].length; j++) {
                if(allPropEscrows[i][j].stakeOwner == msg.sender) {
                    propCount++;
                    break;
                }
            }
        }
        return propCount;
    }

    function checkBalance(address _user) public view returns(uint256) {
        return mwtContract.checkBal(_user);
    }

    function findPropEscrow(uint _propID, address _owner) public view returns(uint, uint, uint, uint, address payable, address payable, uint, uint) {
        uint index;
        for(uint i=0; i<allPropEscrows[_propID].length; i++) {
            if(allPropEscrows[_propID][i].stakeOwner == _owner) {
                index = i;
                break;
            }
        }
        uint _status;
        PropEscrow memory myEscrow = allPropEscrows[_propID][index];
        if (myEscrow.currState == PropEscrowState.NONE) {
            _status=0;
        } else if (myEscrow.currState == PropEscrowState.AWAITING_PAYMENT) {
            _status=1;
        } else if (myEscrow.currState == PropEscrowState.AWAITING_TRANSFER) {
            _status=2;
        } else if (myEscrow.currState == PropEscrowState.COMPLETE) {
            _status=3;
        }
        return (myEscrow.propID, myEscrow.percentage, myEscrow.value, myEscrow.amount, myEscrow.stakeOwner, myEscrow.buyer, myEscrow.salePercent, _status);
    }

    function updatePropEscrowStatus(uint _propID, address _user, address payable _buyer, uint _amt, uint _status) public {
        uint index;
        for(uint i=0; i<allPropEscrows[_propID].length; i++) {
            if(allPropEscrows[_propID][i].stakeOwner == _user) {
                index = i;
                break;
            }
        }
        allPropEscrows[_propID][index].buyer = _buyer;
        allPropEscrows[_propID][index].amount = _amt;
        if (_status == 0) {
            allPropEscrows[_propID][index].currState = PropEscrowState.NONE;
        } else if (_status == 1) {
            allPropEscrows[_propID][index].currState = PropEscrowState.AWAITING_PAYMENT;
        } else if (_status == 2) {
            allPropEscrows[_propID][index].currState = PropEscrowState.AWAITING_TRANSFER;
        } else if (_status == 3) {
            allPropEscrows[_propID][index].currState = PropEscrowState.COMPLETE;
        }
    }

    function transferPropEscrow(uint _propID, address payable _from, address payable _to) public {
        uint index;
        for(uint i=0; i<allPropEscrows[_propID].length; i++) {
            if(allPropEscrows[_propID][i].stakeOwner == _from) {
                index = i;
                break;
            }
        }

        PropEscrow memory myEscrow = allPropEscrows[_propID][index];
        myEscrow.currState = PropEscrowState.AWAITING_TRANSFER;

        //transfer property by updating escrow
        require(myEscrow.currState == PropEscrowState.AWAITING_TRANSFER);
        // if 100% transfer, just change existing escrow. else, modify existing escrow and create new one for new stakeholder.
        if (myEscrow.salePercent == 100) {
            myEscrow.stakeOwner = myEscrow.buyer;
            myEscrow.value = myEscrow.amount;
            myEscrow.currState = PropEscrowState.NONE;
            myEscrow.salePercent = 0;
            allPropEscrows[_propID][index] = myEscrow;
        } else {
            addPropEscrow(_propID, myEscrow.salePercent, myEscrow.amount, _to, _to);
            myEscrow.value = myEscrow.value - myEscrow.amount;
            myEscrow.amount = myEscrow.value;
            myEscrow.percentage = myEscrow.percentage - myEscrow.salePercent;
            myEscrow.currState = PropEscrowState.NONE;
            myEscrow.buyer = myEscrow.stakeOwner;
            myEscrow.salePercent = 0;
            allPropEscrows[_propID][index] = myEscrow;
        }
    }

    //function to transfer DT tokens between accounts
    function transferMWT(address _from, address _to, uint256 _amt) public {
        mwtContract.transfer(_from, _to, _amt);
    }

    //modifier to ensure a function is callable only by its owner    
    modifier ownerOnly(uint _propID) {
        uint index;
        for(uint i=0; i<allPropEscrows[_propID].length; i++) {
            if(allPropEscrows[_propID][i].stakeOwner == msg.sender) {
                index = i;
                break;
            }
        }
        require(index>=0, "You are not a stakeholder in this property!");
        _;
    }

}