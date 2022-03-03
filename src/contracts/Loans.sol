pragma solidity ^0.5.0;
import "./MWToken.sol";

contract Loans {

    MWToken mwtContract;

    constructor (MWToken mwtAddress) public {
        mwtContract = mwtAddress;
    }

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
    struct LoanEscrow {
        uint loanID;
        address payable buyer;
        address payable provider;
        uint amount;
        uint duration;
        loanEscrowState currState;
    }
    mapping(uint => Loan) public allLoans;
    mapping(uint => LoanEscrow) public allLoanEscrows;

    function createLoan(uint _propID, uint _amount, uint _duration) public {
        totalLoansCounter = totalLoansCounter + 1;
        Loan memory myLoan = Loan({
            loanID: totalLoansCounter,
            propID: _propID,
            buyer: msg.sender,
            provider: msg.sender,
            amount: _amount,
            duration: _duration,
            balamount: _amount,
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
    }

    function applyLoan(uint _loanID) public {
        allLoans[_loanID].currState = loanState.APPLIED;
    }

    function cancelLoan(uint _loanID) public {
        allLoans[_loanID].currState = loanState.NONE;
    }

    function payMortgage(uint _loanID) public payable {
        require(allLoans[_loanID].buyer == msg.sender);
        require(allLoans[_loanID].currState == loanState.IN_FORCE, "Loan has not been disbursed!");
        require(allLoanEscrows[_loanID].currState == loanEscrowState.DISBURSED, "Loan has not been disbursed!");

        uint amt = allLoans[_loanID].balamount / allLoans[_loanID].balduration;
        transferMWT(msg.sender, allLoans[_loanID].provider, amt);
        allLoans[_loanID].balamount = allLoans[_loanID].balamount - amt;
        allLoans[_loanID].balduration = allLoans[_loanID].balduration - 1;

        if (allLoans[_loanID].balamount == 0) {
            allLoans[_loanID].currState = loanState.COMPLETE;
            allLoanEscrows[_loanID].currState = loanEscrowState.COMPLETE;
        }
    }

    function payBalance(uint _loanID) public payable {
        require(allLoans[_loanID].buyer == msg.sender);
        require(allLoans[_loanID].currState == loanState.IN_FORCE, "Loan has not been disbursed!");
        require(allLoanEscrows[_loanID].currState == loanEscrowState.DISBURSED, "Loan has not been disbursed!");

        transferMWT(msg.sender, allLoans[_loanID].provider, allLoans[_loanID].balamount);
        allLoans[_loanID].balamount = 0;
        allLoans[_loanID].balduration = 0;
        allLoans[_loanID].currState = loanState.COMPLETE;
        allLoanEscrows[_loanID].currState = loanEscrowState.COMPLETE;
    }

    function findLoan(uint _loanID) public view returns(uint, uint, address payable, address payable, uint, uint, uint, uint, uint) {
        uint _status;
        Loan memory myLoan = allLoans[_loanID];
        if (myLoan.currState == loanState.NONE) {
            _status=0;
        } else if (myLoan.currState == loanState.APPLIED) {
            _status=1;
        } else if (myLoan.currState == loanState.IN_FORCE) {
            _status=2;
        } else if (myLoan.currState == loanState.COMPLETE) {
            _status=3;
        }
        return (myLoan.loanID, myLoan.propID, myLoan.buyer, myLoan.provider, myLoan.amount, myLoan.duration, myLoan.balamount, myLoan.balduration, _status);
    }

    function findLoanEscrow(uint _loanID) public view returns(uint, address payable, address payable, uint, uint, uint) {
        uint _status;
        LoanEscrow memory myEscrow = allLoanEscrows[_loanID];
        if (myEscrow.currState == loanEscrowState.NONE) {
            _status=0;
        } else if (myEscrow.currState == loanEscrowState.ACCEPTED) {
            _status=1;
        } else if (myEscrow.currState == loanEscrowState.DISBURSED) {
            _status=2;
        } else if (myEscrow.currState == loanEscrowState.COMPLETE) {
            _status=3;
        }
        return (myEscrow.loanID, myEscrow.buyer, myEscrow.provider, myEscrow.amount, myEscrow.duration, _status);
    }

    function updateLoan(uint _loanID, address payable _provider, uint _state) public {
        allLoans[_loanID].provider = _provider;
        if (_state == 0) {
            allLoans[_loanID].currState = loanState.NONE;
        } else if (_state == 1) {
            allLoans[_loanID].currState = loanState.APPLIED;
        } else if (_state == 2) {
            allLoans[_loanID].currState = loanState.IN_FORCE;
        } else if (_state == 3) {
            allLoans[_loanID].currState = loanState.COMPLETE;
        }
    }

    function updateLoanEscrow(uint _loanID, address payable _provider, uint _amount, uint _duration, uint _state) public {
        allLoanEscrows[_loanID].provider = _provider;
        allLoanEscrows[_loanID].amount = _amount;
        allLoanEscrows[_loanID].duration = _duration;
        if (_state == 0) {
            allLoanEscrows[_loanID].currState = loanEscrowState.NONE;
        } else if (_state == 1) {
            allLoanEscrows[_loanID].currState = loanEscrowState.ACCEPTED;
        } else if (_state == 2) {
            allLoanEscrows[_loanID].currState = loanEscrowState.DISBURSED;
        } else if (_state == 3) {
            allLoanEscrows[_loanID].currState = loanEscrowState.COMPLETE;
        }
        
    }

    //function to transfer MWT tokens between accounts
    function transferMWT(address _from, address _to, uint256 _amt) public {
        mwtContract.transfer(_from, _to, _amt);
    }

}