const fs = require("fs");
const path = require("path");
const { Web3 } = require("web3");

// ✅ Load environment variables
require("dotenv").config();

// ✅ Define Provider URL (Default: Ganache)
const providerUrl = process.env.PROVIDER_URL || "http://127.0.0.1:7545";

// ✅ Initialize Web3
const web3 = new Web3(providerUrl);

// ✅ Load Contract Details
const getContractInstance = async () => {
    try {
        console.log("🔹 Connecting to Ethereum network...");
        const networkId = await web3.eth.net.getId();
        console.log("✅ Connected to Network ID:", networkId);

        // ✅ Load Contract ABI & Address from Truffle Build
        const contractPath = path.join(__dirname, "contracts", "Voting.json");
        if (!fs.existsSync(contractPath)) {
            throw new Error("❌ Contract JSON file not found!");
        }

        const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf-8"));
        const contractData = contractJson.networks[networkId];

        if (!contractData || !contractData.address) {
            throw new Error(`❌ Contract not deployed on network ID: ${networkId}`);
        }

        console.log("✅ Smart Contract Address:", contractData.address);

        return new web3.eth.Contract(contractJson.abi, contractData.address);
    } catch (error) {
        console.error("❌ Error loading contract:", error.message);
        return null;
    }
};

// ✅ Export Web3 and Contract Instance Loader
module.exports = {
    web3,
    getContractInstance
};
