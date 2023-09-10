// Header.js
import React, { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [address, setAddress] = useState("");
  const [tronWebInstance, setTronWebInstance] = useState(null);

  useEffect(() => {
    const connectTronLink = async () => {
      if (window.tronWeb && window.tronWeb.ready) {
        setAddress(window.tronWeb.defaultAddress.base58);
      } else {
        setTimeout(connectTronLink, 500);
      }
    };
    connectTronLink();
  }, []);
  

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Carbon Credits Marketplace</h1>
        <div className="wallet-status">
          {address ? (
            <span>
              Connected: <span className="wallet-address">{address}</span>
            </span>
          ) : (
            <span>Connecting to TronLink...</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
