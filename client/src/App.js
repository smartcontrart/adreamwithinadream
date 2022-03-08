import React, { Component } from "react";
import adreamwithinadream  from "./contracts/adreamwithinadream.json";
// import ash  from "./contracts/fakeASH.json";
import ash  from "./contracts/Ash.json";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Video from "./DWD_GOLD_mint.mp4";
import Web3 from "web3";


import "./App.css";

class App extends Component {
  state = {
    account: null,
    networkId: null,
    dropLive: false,
    walletWLspots: null,
    walletDreamBalance: null,
    walletAshBalance: null,
    tokensClaimed: null,
    transactionInProgress: false,
    userFeedback: null,
    priceInAsh: 15000000000000000000,
    dropDate: Date.parse('01 Mar 2022 16:00:00 GMT'),
    dropEnd: Date.parse('03 Mar 2022 16:00:00 GMT'),
    dateNow: Date.now()
  }

  componentDidMount = async () => {
    if(this.state.dateNow >= this.state.dropDate  && this.state.dateNow <= this.state.dropEnd){
      this.setState({dropLive: true});
    }else{
      this.startTimer();
    }
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    } else if (window.web3) {
      this.web3  = new Web3(window.web3.currentProvider);
    };
    if(this.web3){
      await this.setNetwork();
      await this.getContractsInstances();
      await this.setAccount();
    }
  }

  async getContractsInstances(){
    this.networkId = await this.web3.eth.net.getId();
    this.deployedNetwork = adreamwithinadream.networks[this.networkId];
      this.adreamwithinadreamInstance = new this.web3.eth.Contract(
        adreamwithinadream.abi,
        1 && '0x57a567A3D179904fDD97476404F077C447193212'
      )
      this.ashInstance = new this.web3.eth.Contract(
        ash.abi,
        1 && '0x64D91f12Ece7362F91A6f8E7940Cd55F05060b92'
      )
  }

  async setAccount(){
    if(this.state.networkId === 1){
      let accounts = await this.web3.eth.getAccounts();
      this.setState({account: accounts[0]});
      if(this.state.account) this.getAccountsData()
    }else{
      this.resetAccountData();
    }
  }

  resetAccountData(){
    this.setState({
      account: null,
      walletDreamBalance: null,
      walletWLspots: null,
      walletAshBalance: null,
      tokensClaimed: null,
    })
  }

  async setNetwork(){
    if(this.web3){
      let networkId = await this.web3.eth.net.getId();
      this.setState({networkId: networkId})
    }
  }

  async getAccountsData(){
    if(this.state.networkId === 1){
      this.setState({
        walletDreamBalance: parseInt(await this.adreamwithinadreamInstance.methods.balanceOf(this.state.account).call()),
        walletWLspots: parseInt(await this.adreamwithinadreamInstance.methods._tokensWhitelisted(this.state.account).call()),
        walletAshBalance: parseFloat(await this.ashInstance.methods.balanceOf(this.state.account).call()),
        tokensClaimed: parseInt(await this.adreamwithinadreamInstance.methods._tokensClaimed(this.state.account).call()),
      });
    }
  }

  async connectWallet(){
    this.setState({transactionInProgress: true})
    try{
      window.ethereum.enable()
    }catch(error){
      console.log(error)
    }
    this.setState({transactionInProgress: false})
  }

  renderConnexionStatus(){
    if(this.state.account){
      return(
        <React.Fragment>
          <p>Your ash balance: {Math.floor(this.state.walletAshBalance/(10**18))}</p>
          <p id='connexion_info'><small>connected as <b>{this.state.account}</b></small></p>

        </React.Fragment>
      )
    }
  }

  handleMintClick = async(amount) => {
    this.setState({
      transactionInProgress: true,
      userFeedback: "...creating your dream..."})
    try{
      let price = this.state.priceInAsh * amount
      await this.ashInstance.methods.approve(this.adreamwithinadreamInstance._address, price.toString()).send({from: this.state.account})
      await this.adreamwithinadreamInstance.methods.mint(this.state.account, amount).send({from: this.state.account});
    }catch(error){
      alert('User rejected the transaction')
    }
    this.setAccount()
    this.setState({transactionInProgress: false,
      userFeedback: null})
  }

  renderButton(tokenNumber){
    if(this.state.walletAshBalance >= tokenNumber * this.state.priceInAsh ){
      return(
        <Button id="mint_button" variant='warning' onClick={() => this.handleMintClick(tokenNumber)}>Mint {tokenNumber} for {tokenNumber * this.state.priceInAsh/(10**18)} Ash!</Button> 
      )
    }else{
      return(
        <Badge id="wl_badge" text="dark" bg="light">Not enough Ash for {tokenNumber}</Badge>
      )
    }
  }

  renderTwoMintButtons(){
    return(
      <React.Fragment>
        {this.renderButton(1)}
        <br/>
        {this.renderButton(2)}
    </React.Fragment>
    )
  }

  renderOneMintButton(){
    return(
      <React.Fragment>
        {this.renderButton(1)}
      </React.Fragment>
    )
  }

  renderClaimBadge(){
    return <Badge id="wl_badge" text="dark" bg="light">NFT Claimed</Badge>
  }

  startTimer(){
    this.myInterval = setInterval(() => {
      this.setState(({ dateNow: dateNow }) => ({
        dateNow: Date.now()
      }))
    }, 1000)
  }

  renderTimer(){
    let secondsToDrop = Math.floor((this.state.dropDate - this.state.dateNow)/1000);
    if(secondsToDrop<=0) this.setState({dropLive: true})
    let timeConsidered = 0
    let days = Math.floor(secondsToDrop/(60*60*24))
    timeConsidered += days*60*60*24
    let hours = Math.floor((secondsToDrop-timeConsidered)/(60*60))
    timeConsidered += hours*60*60
    let minutes = Math.floor((secondsToDrop-timeConsidered)/(60))
    timeConsidered += minutes*60
    let seconds = (secondsToDrop-timeConsidered)
    return ` ${days < 10 ? '0' + days : days} : ${hours < 10 ? '0' + hours : hours} : ${minutes < 10 ? '0' + minutes : minutes}  : ${seconds < 10 ? '0' + seconds : seconds} `
  }

  renderUserInterface(){
    if(this.web3){
      if(this.state.dropLive){
        if(this.state.transactionInProgress){
          return(
            <React.Fragment>
              <Spinner animation="grow" variant="warning"/>
              <span>{this.state.userFeedback}</span>
            </React.Fragment>
          )
        }else{
          if(this.state.networkId !== 1){
            return(<p>Please connect your wallet to Mainnet</p>)
          }else if(!this.state.account){
            return(
              <Button id="connect_button" variant='dark' onClick={() => this.connectWallet()}>Connect your wallet</Button> 
            )
          }else{
            let availableToMint = this.state.walletWLspots - this.state.tokensClaimed
            if(availableToMint > 2){
              if(this.state.walletDreamBalance === 0){
                return this.renderTwoMintButtons();
              }else if(this.state.walletDreamBalance === 1){
                return this.renderOneMintButton();
              }else{
                return this.renderClaimBadge();
              }
            }
            if(availableToMint === 2){
                return this.renderTwoMintButtons();
            }else if(availableToMint === 1 || availableToMint > 1 && this.state.walletDreamBalance === 1){
              return this.renderOneMintButton();
            }else{
              if(this.state.walletWLspots) { //Doesn't work
                return this.renderClaimBadge();
              }else{
                return(
                  <Badge id="wl_badge" text="dark" bg="light">You're not on the WL</Badge>
                )
              }
            }
          }
        }
      }else if(this.state.dateNow <= this.state.dropDate){
        return(
          <div>
           Drops in {this.renderTimer()}
          </div>
        )
      }else{
        return(
          <div>
            Drop closed
          </div>
        )
      }
    }else{
      return(
        <Alert id="web3_alert" variant="dark">No Wallet detected</Alert>
      )
    }
  }

  render() {
    if(this.web3 && this.state.dropLive){
      window.ethereum.on('accountsChanged', async () => {
        await this.setAccount()
      })
      window.ethereum.on('networkChanged', async (networkId) => {
        await this.setNetwork(networkId)
        await this.setAccount();
      });
    }
    return (
      <div className="App">
        <Row id="App_row">
          <Row id="title_row">
            <h3>"a dream within a dream"</h3>
            <span>a dynamic $ASH exclusive drop by Mihai Grecu</span>
          </Row>
          <Row id="video_row">
            <video id="video_player" loop autoPlay muted src={Video} type="video/mp4" />
          </Row>
          <Row id="button_row">
            {this.renderUserInterface()}
          </Row>
          <Row id="about_row">
            {/* <span>A dream within a dream is a dynamic NFT.</span> */}
            <span>15 ASH</span> 
            <span>Whitelist only</span> 
          </Row>
          <Row id="connexion_status">
            {this.renderConnexionStatus()}
          </Row>
        </Row>
      </div>
    );
  }
  
}

export default App;

