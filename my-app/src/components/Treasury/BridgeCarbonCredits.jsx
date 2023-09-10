import React, { useState } from 'react';
import './BridgeCarbonCredits.css';
import tronWeb from '../../utils/tronWeb';
import { bridge } from '../../utils/contracts';

const BridgeCarbonCredits = () => {
    const [wrapperAddress, setWrapperAddress] = useState('');
    const [amount, setAmount] = useState('');

    const bridgeCarbonCredits = async () => {
        if (!tronWeb.defaultAddress.hex) return;

        const parsedAmount = tronWeb.toSun(amount);
        try {
            const tx = await bridge.bridge(wrapperAddress, parsedAmount).send({ from: tronWeb.defaultAddress.hex });
            alert('Carbon credits bridged successfully!');
        } catch (error) {
            console.error('Error bridging carbon credits:', error);
        }
    };

    return (
        <div className="bridge-carbon-credits">
            <h2>Bridge Carbon Credits</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    bridgeCarbonCredits();
                }}
            >
                <label htmlFor="wrapperAddress">Wrapper Address:</label>
                <input
                    type="text"
                    id="wrapperAddress"
                    value={wrapperAddress}
                    onChange={(e) => setWrapperAddress(e.target.value)}
                />
                <label htmlFor="bridgeAmount">Amount to Bridge:</label>
                <input
                    type="number"
                    id="bridgeAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.000000000000000001"
                />
                <button type="submit">Bridge</button>
            </form>
        </div>
    );
};

export default BridgeCarbonCredits;
