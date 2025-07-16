require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers'); // Import ethers.js
const sequelize = require('./db');
const User = require('./models/user');
const contractConfig = require('./contracts/Voting.json');
const { router: adminAuth } = require('./adminAuth'); 
const { getContractInstance } = require("./web3Utils");
const app = express();
const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const PROVIDER_URL = process.env.PROVIDER_URL || 'http://127.0.0.1:8545';

// ✅ **Fix: Avoid ENS Resolution**
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);

// ✅ CORS Configuration
app.use(cors({ origin: "http://localhost:3000", methods: "GET,POST", allowedHeaders: "Content-Type, Authorization" }));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/admin', adminAuth);


// ✅ Sync Database
sequelize.sync()
    .then(() => console.log('✅ Database Synced'))
    .catch(err => console.error('❌ Sync Error:', err));

// ✅ Root Route
app.get('/', (req, res) => res.send("🚀 Server is running!"));

// ✅ **Fix: Get Smart Contract Instance**
// Load contract instance automatically on startup
const loadContract = async () => {
    try {
        const contract = await getContractInstance("Voting"); // Use your contract name here
        if (!contract) {
            console.error("❌ Failed to load contract.");
            return;
        }
        console.log("✅ Smart Contract loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading contract:", error);
    }
};

// Load the contract when the server starts



// ✅ **User Registration API**
app.post('/register', async (req, res) => {
    try {
        const { full_name, email, voter_id, aadhaar_number, password, face_descriptor } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            full_name,
            email,
            voter_id,
            aadhaar_number,
            password: hashedPassword,
            face_descriptor,
            hasVoted: false
        });

        res.status(201).json({ message: "✅ Registration successful", user: newUser });
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).json({ message: "❌ Error registering user", error });
    }
});

// ✅ **User Login API**
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "❌ Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "✅ Login successful", token });
    } catch (error) {
        console.error('❌ Login Error:', error);
        res.status(500).json({ message: "❌ Error logging in", error });
    }
});

// ✅ **Fetch User Info (Protected Route)**
app.get('/user', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "❌ No token provided." });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, SECRET_KEY, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "❌ Invalid or expired token." });

            const user = await User.findOne({ where: { id: decoded.id }, attributes: ['full_name', 'email', 'voter_id', 'aadhaar_number', 'hasVoted'] });

            if (!user) return res.status(404).json({ message: "❌ User not found." });

            res.json(user);
        });
    } catch (error) {
        console.error('❌ Fetch User Error:', error);
        res.status(500).json({ message: "❌ Error fetching user details", error });
    }
});

// ✅ **Fix: Voting API**
// ✅ **Fix: Voting API**
app.post('/vote', async (req, res) => {
    try {
        // 🔹 Validate Auth Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ message: "❌ No token provided." });
        }

        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            return res.status(403).json({ message: "❌ Invalid or expired token." });
        }

        const userId = decoded.id;
        if (!userId) return res.status(403).json({ message: "❌ Unauthorized action." });

        // 🔹 Validate Candidate ID
        const { candidateId } = req.body;
        if (!candidateId) return res.status(400).json({ message: "❌ Candidate ID is required." });

        // 🔹 Fetch User from Database
        const user = await User.findOne({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: "❌ User not found." });

        // 🔹 Check if the user has already voted
        if (user.hasVoted) {
            return res.status(403).json({ message: "❌ You have already voted!" });
        }

        // 🔹 Get Smart Contract Instance
        const contract = await getContractInstance();
        if (!contract) return res.status(500).json({ message: "❌ Smart contract not available." });

        try {
            console.log("📌 Initiating transaction...");

            // ✅ **Send Vote Transaction from Backend Wallet**
            const tx = await contract.methods.vote(candidateId).send({
                from: wallet.address,
                gas: 500000
            });

            console.log("✅ Transaction Hash:", tx.hash);

            // 🔹 Mark user as voted in the database
            await User.update({ hasVoted: true }, { where: { id: userId } });

            console.log("✅ Vote recorded successfully!");
            res.json({ message: "✅ Vote recorded successfully!", transactionHash: tx.hash });

        } catch (contractError) {
            console.error("❌ Contract Voting Error:", contractError);
            return res.status(400).json({ message: "❌ Transaction failed: " + (contractError.reason || "Unknown error") });
        }

    } catch (error) {
        console.error("❌ Voting error:", error);
        res.status(500).json({ message: "❌ Failed to record vote.", error });
    }
});




app.get('/get-vote-counts', async (req, res) => {
    try {
        const contract = await getContractInstance();
        if (!contract) {
            return res.status(500).json({ message: "❌ Smart contract not available." });
        }

        // ✅ Fix: Use `.methods.candidateCount().call()`
        const candidateCount = await contract.methods.candidateCount().call();
        let voteCounts = {};

        for (let i = 1; i <= candidateCount; i++) {
            try {
                // ✅ Fix: Use `.methods.getVotes(candidateId).call()`
                const votes = await contract.methods.getVotes(i).call();
                voteCounts[i] = votes.toString(); // Convert BigNumber to string
            } catch (err) {
                console.error(`❌ Error fetching votes for candidate ${i}:`, err);
            }
        }

        res.json(voteCounts);
    } catch (error) {
        console.error("❌ Error fetching vote counts:", error);
        res.status(500).json({ message: "❌ Failed to retrieve vote counts.", error: error.message });
    }
});


loadContract();
// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
