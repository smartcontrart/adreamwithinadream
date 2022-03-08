require('dotenv').config()
const WL = require("./ContractData/WL/WL.json")
const URIS = require("./ContractData/URIs/URIs.json")
// const MINTERS = require("./ContractData/Minters.json")

var contract = artifacts.require("adreamwithinadream");
var prod_contract_address = process.env.PROD_CONTRACT_ADDRESS;
var dev_contract_address = process.env.DEV_CONTRACT_ADDRESS;
module.exports = async function() {
    const dream = await contract.at(dev_contract_address);
    console.log(dev_contract_address)
    // const WLaddresses = WL.addresses;
    // const WLamounts = WL.amounts;
    // const URIs = URIS.normalList;
    // const UpdatedURIs = URIS.edgeList;
    // const royalties_recipient_address = process.env.ROYALTIES_RECIPIENT_ADDRESS;
    // const royaltiesAmount = 10; //In %
    // const minters = MINTERS.addresses

    // console.log(await dream.isAdmin(GrecuAddress))

    // if(WLaddresses.length !== WLamounts.length){
    //     console.log('Error with the WL - please check data')
    // }else if(URIs.length !== 5){
    //     console.log('Error with the URIs - please check data')
    // }
    // else{
    //     // for(let i =0; i< minters.length; i++ ){
    //     //     console.log(await dream.balanceOf(minters[i]))
    //     // }

    //     // Update the URIs
            // console.log('Updating URIs')
            // try{
            //     let res = await dream.updateURIs(URIs);
            //     console.log('Successfully updated URIS')
            //     console.log(res)
            //     console.log('/////////////////////////')
            // }catch(err){console.log(err)}
    
        //     Check the URIs
            // console.log('Getting URIs')
            // try{
            //     let res = await dream.getURIs();
            //     console.log(res);
            // }catch(err){console.log(err)}
            
    //     //     Load the WL
    //         console.log('Loading the WL')
    //         try{
    //             let res = await dream.loadWL(WLaddresses, WLamounts);
    //             console.log('Successfully loaded the WL')
    //             console.log(res)
    //             console.log('/////////////////////////')
    //         }catch(err){console.log(err)}
    
    //     //     Set royalties info
    //         console.log('Setting royalties info')
    //         try{
    //             let res = await dream.setRoyalties(GrecuAddress, royaltiesAmount);
    //             console.log('Successfully set Royalties info')
    //             console.log(res)
    //             console.log('/////////////////////////')
    //         }catch(err){console.log(err)}
    // }
        console.log('program done executing - please terminate')
}