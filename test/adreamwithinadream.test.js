const adreamwithinadream = artifacts.require("./adreamwithinadream.sol");
const assert = require('assert');

contract("adreamwithinadreamTest", accounts => {

  beforeEach(async() =>{
    nft = await adreamwithinadream.deployed();
  });
  
  it("... should deploy with less than 4.7 mil gas", async () => {
    let adreamwithinadreamInstance = await adreamwithinadream.new();
    let receipt = await web3.eth.getTransactionReceipt(adreamwithinadreamInstance.transactionHash);
    console.log(receipt.gasUsed);
    assert(receipt.gasUsed <= 4700000, "Gas was more than 4.7 mil");
  });

  
  it("... should not mint at contract deployement", async () => {
    await assert.rejects(nft.mint(accounts[0],1), 'Successfully minted without adding URI');
  });
  
  it("... should be able to add URIs to the contract", async () =>{
    let uris = await nft.getURIs();
    assert.equal(uris.length, 0, `The contract had ${uris.length} URIs at deployment`);
    
    await nft.updateURIs(["test"])
    uris = await nft.getURIs();
    assert.equal(uris.length, 1, `The contract had ${uris.length} URIs after adding test`);
    
    let URIs = ["test1", "test2", "test3", "test4", "test5"]
    await nft.updateURIs(URIs)
    uris = await nft.getURIs();
    assert.equal(uris.length, URIs.length, `The contract had ${uris.length} URIs after adding ${URIs.length}`);
  })

  it("... should load the whitelist", async()=>{
    let accountsWhitelisted = [accounts[2], accounts[3], accounts[4], accounts[5], accounts[6]]
    let amountsWhitelisted = [1,2,3,4,5]
    let amountsWhitelistedWrong = [1,2,3,4,5,6]

    // await assert.rejects(nft.loadWL(accountsWhitelisted, amountsWhitelistedWrong));
    assert(await nft.loadWL(accountsWhitelisted, amountsWhitelisted), 'Could not load whitelist');
    
    for(i=0; i< accountsWhitelisted.length; i++){
      assert(await nft._tokensWhitelisted.call(accountsWhitelisted[i]), amountsWhitelisted[i], "token does not have the right amount of WL spots");
    }
  })
  
  it("... should mint with URIs", async () =>{
    await assert.rejects(nft.mint(accounts[2], 2, {from: accounts[2]}), "Can't mint more tokens than WL");
    assert(await nft.mint(accounts[2], 1, {from: accounts[2]}), 'Could not mint a token');
  })

  it("... should not mint more than 2 times by transferring the balance",async ()=>{
    assert(await nft.mint(accounts[3], 2, {from: accounts[3]}), "couldn't mint but should have been able to")
    await nft.safeTransferFrom(accounts[3], accounts[7], 2, {from: accounts[3]})
    await nft.safeTransferFrom(accounts[3], accounts[7], 3, {from: accounts[3]})
    await assert.rejects(nft.mint(accounts[3], 2, {from: accounts[3]}), 'Could mint again after transferring its balance')
  })

  it('... should increase the URI and stop at max URI on transfer', async() =>{
    const num_of_Transfers = 10
    let uris = await nft.getURIs()
    const stages = uris.length
    
    for(i =1; i< num_of_Transfers; i++){
      assert.equal(await nft.tokenURI(1), `test${i >= stages ? stages : i}`, `token URI was ${await nft.tokenURI(1)} and was expecting test${i >= stages ? stages : i}`)    
      await nft.safeTransferFrom(accounts[(i+1)%2 + 2], accounts[(i)%2 + 2], 1, {from: accounts[(i+1)%2 +2]})
    }
  })

  it("... should delete its URIs", async ()=>{
    await nft.updateURIs([])
    let uris = await nft.getURIs();
    assert.equal(uris.length, 0, `The contract still had ${uris.length} URIs after adding 3`);
  })

  it("... should add Admins", async ()=>{
    await nft.approveAdmin(accounts[7], {from: accounts[0]})
    let admins = await nft.getAdmins();
    // let is0Admin = admins.includes(accounts[0]) ?  true :  false;
    let is1Admin = admins.includes(accounts[7]) ?  true :  false;
    // assert.equal(is0Admin, true, `${accounts[0]} was not added as Admin and was expected to be`);
    assert.equal(is1Admin, true, `${accounts[7]} was not added as Admin and was expected to be`);
  })


  it("... should allow to perform tasks", async () =>{
    // add to WL
    assert(nft.loadWL([accounts[7]], [1], {from: accounts[7]}), 'could add to the WL')
    currentURI = await nft.getURIs()
    await nft.updateURIs(["newURI"], {from: accounts[7]})
    let URIs = await nft.getURIs({from: accounts[7]});
    assert.equal(currentURI.length + 1, URIs.length, "Couldn't add URI despite being granted admin role")
    assert(await nft.mint(accounts[9], 1, {from: accounts[7]}), 'Could not airdrop a token');
    let ac9Bal = await nft.balanceOf(accounts[9])
    assert.equal (ac9Bal, 1, "expected airdropped account an NFT but didn't have one")
    assert(await nft.mintSpecial(accounts[9], "test1", {from: accounts[7]}), 'Could not airdrop a token');
    assert.equal("test1", await nft.tokenURI(5), {from: accounts[7]}, "the special mint doesn't have the right URI")
  })

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(nft.mint(accounts[8], 2, {from: accounts[8]}), "could use mint without being an admin");
    await assert.rejects(nft.loadWL([accounts[8]], [8], {from: accounts[8]}), 'could add to the WL but was not expected to be able to')
    await assert.rejects(nft.updateURIs(['my own media'], {from: accounts[8]}), 'could add an URI but was not admin')
    await assert.rejects(nft.setRoyalties(accounts[8], 100, {from: accounts[8]}), 'could edit royalties but was not admin')
  })
  
  it("... should remove Admins", async ()=>{
    await nft.revokeAdmin(accounts[7], {from: accounts[0]})
    let admins = await nft.getAdmins();
    let isAdmin = admins.includes(accounts[7]) ?  true :  false;
    assert.equal(isAdmin, false, `${accounts[7]} was an Admin and was expected not to be`); 
  })

  it("... should prevent non Admins to perform tasks", async () =>{
    await assert.rejects(nft.mint(accounts[7], 2, {from: accounts[7]}), "could use mint without being an admin");
    await assert.rejects(nft.loadWL([accounts[7]], [6], {from: accounts[7]}), 'could add to the WL but was not expected to be able to')
    await assert.rejects(nft.updateURIs(['my own media'], {from: accounts[7]}), 'could add an URI but was not admin')
    await assert.rejects(nft.setRoyalties(accounts[7], 100, {from: accounts[7]}), 'could edit royalties but was not admin')
  })
  
});
