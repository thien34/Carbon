import React, { useState } from 'react';
import './WrapCarbonCredits.css';
import tronWeb from '../../utils/tronWeb';
import { wrappedBCT } from '../../utils/contracts';

const WrapCarbonCredits = () => {
    const [amount, setAmount] = useState('');

    const wrapCarbonCredits = async () => {
        if (!tronWeb.defaultAddress.hex) return;

        const parsedAmount = tronWeb.toSun(amount);
        try {
            const tx = await wrappedBCT.wrap(parsedAmount).send({ from: tronWeb.defaultAddress.hex });
            alert('Carbon credits wrapped successfully!');
        } catch (error) {
            console.error('Error wrapping carbon credits:', error);
        }
    };

    return (
        <div className="wrap-carbon-credits">
            <h2>Wrap Carbon Credits</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    wrapCarbonCredits();
                }}
            >
                <label htmlFor="wrapAmount">Amount to Wrap:</label>
                <input
                    type="number"
                    id="wrapAmount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.000000000000000001"
                />
                <button type="submit">Wrap</button>
            </form>
        </div>
    );
};

export default WrapCarbonCredits;
