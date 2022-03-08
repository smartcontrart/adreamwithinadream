
var contract = artifacts.require("adreamwithinadream");
var contract_address = '0x57a567A3D179904fDD97476404F077C447193212';

module.exports = async function() {
    const dream = await contract.at(contract_address);
        console.log(dream.transactions)

        console.log('program done executing - please terminate')
}