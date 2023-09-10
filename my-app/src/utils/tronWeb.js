import TronWeb from "tronweb";

const FULL_NODE = "http://localhost:9090";
const SOLIDITY_NODE = "http://localhost:9090";
const EVENT_SERVER = "http://localhost:9090";
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY; // Replace with your private key or use an environment variable


const tronWeb = new TronWeb({
  fullNode: FULL_NODE,
  solidityNode: SOLIDITY_NODE,
  eventServer: EVENT_SERVER,
  privateKey: PRIVATE_KEY,
});

export default tronWeb;
