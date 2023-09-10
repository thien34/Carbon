import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import BuyCarbonCredits from './components/Customer/BuyCarbonCredits';
import SellCarbonCredits from './components/Customer/SellCarbonCredits';
import OffsetCarbonFootprint from './components/Customer/OffsetCarbonFootprint';
import WrapCarbonCredits from './components/Treasury/WrapCarbonCredits';
import BridgeCarbonCredits from './components/Treasury/BridgeCarbonCredits';
import { treasury }from './utils/contracts' ;
import tronWeb from "./utils/tronWeb";


const { address: treasuryAddress } = treasury;

function App() {
  const [connected, setConnected] = useState(false);
  const [userType, setUserType] = useState('customer');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const connectTronLink = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setAddress(window.tronWeb.defaultAddress.base58);
        setConnected(true);

        const isTreasury = await checkIfTreasury(window.tronWeb.defaultAddress.base58);
        if (isTreasury) {
          setUserType('treasury');
        } else {
          setUserType('customer');
        }
      } else {
        setTimeout(connectTronLink, 500);
      }
    };
    connectTronLink();
  }, []);

  // Replace this with the actual function to check if the address is owner of the treasury contract.
  const checkIfTreasury = async (address) => {
    if (address && window.tronWeb && window.tronWeb.ready) {
      try {
        const contractInstance = await window.tronWeb.contract(treasury.abi, treasuryAddress);
        const ownerAddress = await contractInstance.methods.owner().call();
        const ownerAddressBase58 = tronWeb.address.fromHex(ownerAddress);
        return ownerAddressBase58 === address;
      } catch (error) {
        console.error('Error checking if the address is owner of the treasury contract:', error);
      }
    }
    return false;
  };
  

  return (
    <div className="App">
      <Header connected={connected} />
      {userType === 'customer' ? (
        <main>
          <BuyCarbonCredits />
          <SellCarbonCredits />
          <OffsetCarbonFootprint />
        </main>
      ) : (
        <main>
          <WrapCarbonCredits />
          <BridgeCarbonCredits />
        </main>
      )}
    </div>
  );
}

export default App;
