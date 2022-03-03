const MWToken = artifacts.require("MWToken");
const Props = artifacts.require("Props");
const Loans = artifacts.require("Loans");
const Marketplace = artifacts.require("Marketplace");

module.exports = function(deployer) {
  deployer
  .deploy(MWToken)
  .then(
    function() {
      return deployer.deploy(Props, MWToken.address)
    }
  )
  .then(
    function() {
      return deployer.deploy(Loans, MWToken.address)
    }
  )
  .then(
    function() {
      return deployer.deploy(Marketplace, Props.address, Loans.address, 10000)
    }
  );
};
