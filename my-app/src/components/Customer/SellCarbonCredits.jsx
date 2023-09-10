import React, { useState } from "react";
import tronWeb from "../../utils/tronWeb";
import { marketplace } from "../../utils/contracts";
import "./SellCarbonCredits.css";

const SellCarbonCredits = () => {
  const userAddress = tronWeb.defaultAddress.hex;
  const [tokenId, setTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [pricePerToken, setPricePerToken] = useState("");
  const [isTRX, setIsTRX] = useState(true);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await marketplace.createListing(
        tokenId,
        amount,
        pricePerToken,
        isTRX
      ).send({ from: userAddress });
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <div className="sell-carbon-credits">
      <h1>Sell Carbon Credits</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Token ID:
          <input
            type="number"
            value={tokenId}
            onChange={(event) => setTokenId(event.target.value)}
          />
        </label>
        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <label>
          Price per Token:
          <input
            type="number"
            value={pricePerToken}
            onChange={(event) => setPricePerToken(event.target.value)}
          />
        </label>
        <label>
          Currency:
          <select
            value={isTRX ? "TRX" : "USDT"}
            onChange={(event) => setIsTRX(event.target.value === "TRX")}
          >
            <option value="TRX">TRX</option>
            <option value="USDT">USDT</option>
          </select>
        </label>
        <button type="submit">Create Listing</button>
      </form>
    </div>
  );
};

export default SellCarbonCredits;
