import React, { useState } from 'react';
import './OffsetCarbonFootprint.css';
import tronWeb from "../../utils/tronWeb";

import { offset } from '../../utils/contracts';

const OffsetCarbonFootprint = () => {
    const [tokenId, setTokenId] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await offset.offsetCarbonCredits(tokenId, amount).send({ from: tronWeb.defaultAddress.base58 });
        } catch (error) {
            console.error('Error offsetting carbon credits:', error);
        }
    };

    return (
        <div className="offset-carbon-footprint">
            <h2>Offset Carbon Footprint</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="tokenId">Token ID</label>
                <input
                    type="number"
                    id="tokenId"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                />
                <label htmlFor="amount">Amount</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button type="submit">Offset Carbon Credits</button>
            </form>
        </div>
    );
};

export default OffsetCarbonFootprint;
