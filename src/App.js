import React, { useEffect, useState } from 'react';
import './App.css';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import myEpicGame from './utils/MyEpicGame.json';
import SelectCharacter from './Components/SelectCharacter';
import twitterLogo from './assets/twitter-logo.svg';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OURWEBSITE = 'https://webarify.id';
const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

// Actions
const checkIfWalletIsConnected = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      /*
       * We set isLoading here because we use return in the next line
       */
      setIsLoading(false);
      return;
    } else {
      console.log('We have the ethereum object', ethereum);

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    }
  } catch (error) {
    console.log(error);
  }
  /*
   * We release the state property after all the function logic
   */
  setIsLoading(false);
};

  // Render Methods
// Render Methods

const renderContent = () => {
  /*
   * If the app is currently loading, just render out LoadingIndicator
   */
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://i.ibb.co/c1FvNSn/Output-onlinegiftools.gif"
          alt="Dino Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return (
      <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
    );
  }
};

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask, Use Desktop Browser & MetaMask Extension!');
        return;
      }

      let chainId = await ethereum.request({ method: 'eth_chainId' });
          console.log("Connected to chain " + chainId);
          
          // String, hex code of the chainId of the Rinkebey test network
          const rinkebyChainId = "0x4"; 
          if (chainId !== rinkebyChainId) {
            alert("You are not connected to the Rinkeby Test Network!");
            return;
          }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  /*
 * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
 */
// UseEffects
useEffect(() => {
  /*
   * Anytime our component mounts, make sure to immiediately set our loading state
   */
  setIsLoading(true);
  checkIfWalletIsConnected();
}, []);

useEffect(() => {
  const fetchNFTMetadata = async () => {
    console.log('Checking for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

    const characterNFT = await gameContract.checkIfUserHasNFT();
    if (characterNFT.name) {
      console.log('User has character NFT');
      setCharacterNFT(transformCharacterData(characterNFT));
    }

    /*
     * Once we are done with all the fetching, set loading state to false
     */
    setIsLoading(false);
  };

  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  }
}, [currentAccount]);

const fetchNFTMetadata = async () => {
  console.log('Checking for Character NFT on address:', currentAccount);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const gameContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    myEpicGame.abi,
    signer
  );

  const txn = await gameContract.checkIfUserHasNFT();
  if (txn.name) {
    console.log('User has character NFT');
    setCharacterNFT(transformCharacterData(txn));
  } else {
    console.log('No character NFT found');
  }
};

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Dinoverse Attack!</p>
          <p className="sub-text">Let's Team Up! Protect Our Dinoverse</p>
          {/* This is where our button and image code used to be!
           *	Remember we moved it into the render method.
           */}
          {renderContent()}
        </div>
        <div className="footer-container">
        <p className="footer-text">An Attempt to Build a turn-based, NFT browser game on Ethereum in Rinkeby Test Network
        by
        <a
            className="footer-text"
            href={OURWEBSITE}
            target="_blank"
            rel="noreferrer"
          >&nbsp;{`@arify`}</a>. </p>
        </div>

        <div className="header">
          <p class="sub-text">Send me an ETH! @ <span>0xd41105953e3818Af03B3E2d810cBeC4077Ba20D2</span></p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
        
        
      </div>
    </div>
  );
};

export default App;