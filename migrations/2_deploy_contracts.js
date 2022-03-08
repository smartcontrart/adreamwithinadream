var adreamwithinadream = artifacts.require("./adreamwithinadream.sol");
var wakeupfromadream = artifacts.require("./wakeupfromadream.sol");

module.exports = function(deployer) {
  deployer.deploy(adreamwithinadream);
  deployer.deploy(wakeupfromadream);
};
