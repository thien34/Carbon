import TronWeb from "tronweb";

const FULL_NODE = "https://api.trongrid.io"; // Mainnet full node
const SOLIDITY_NODE = "https://api.trongrid.io"; // Mainnet solidity node
const EVENT_SERVER = "https://api.trongrid.io"; // Mainnet event server
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY; // Replace with your private key or use an environment variable

const tronWeb = new TronWeb({
  fullNode: FULL_NODE,
  solidityNode: SOLIDITY_NODE,
  eventServer: EVENT_SERVER,
  privateKey: PRIVATE_KEY,
});

export default tronWeb;
