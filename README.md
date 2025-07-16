# 🗳️ Voting Backend

This is the backend for the **Online Blockchain Voting System**, built with **Node.js**, **Express**, **Sequelize (PostgreSQL)**, and integrated with **Ethereum Smart Contracts (via ethers.js)**. It also includes **JWT-based authentication**, **Face Recognition support**, and **Admin Routes** for secure voting.

---

## 🚀 Features

- ✅ User registration with hashed passwords and facial descriptor
- ✅ JWT-based authentication
- ✅ Smart contract interaction using `ethers.js`
- ✅ PostgreSQL integration using Sequelize ORM
- ✅ Vote recording & real-time vote count
- ✅ Admin routes
- ✅ Secure voting (one vote per user)

---

## 📦 Tech Stack

| Layer         | Technology                         |
|---------------|-------------------------------------|
| Language      | Node.js                             |
| Framework     | Express.js                          |
| Database      | PostgreSQL (via Sequelize)          |
| Blockchain    | Ethereum (Ganache/Testnet compatible) |
| Auth          | JWT + Bcrypt                        |
| AI            | Face Recognition (via face-api.js)  |

---

## 🔧 Setup Instructions

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/jagadish-cell/voting-backend.git
cd voting-backend
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Configure Environment Variables
Create a .env file in the root:

env
Copy
Edit
PORT=8000

# PostgreSQL
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432

# JWT (keep this secret)
JWT_SECRET=your_jwt_secret

# Blockchain
PROVIDER_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_wallet_private_key
⚠️ Replace the values with your actual credentials.

4️⃣ Start the Server
bash
Copy
Edit
node index.js
Optionally use nodemon during development:

bash
Copy
Edit
npx nodemon index.js
📡 API Endpoints
Method	Endpoint	Description
POST	/register	Register a new user
POST	/login	Login with email/password
GET	/user	Get logged-in user data
POST	/vote	Cast a vote (auth needed)
GET	/get-vote-counts	Get vote tally

🛡️ Security Notes
Passwords are securely hashed with bcrypt

JWTs are used for stateless authentication

Voters can vote only once (tracked via DB & blockchain)

Facial recognition ensures identity verification (frontend)

📁 Folder Structure
bash
Copy
Edit
voting-backend/
├── contracts/         # Smart contract ABI (Voting.json)
├── models/            # Sequelize models
│   └── user.js
├── utils/             # Blockchain interaction helpers
│   └── web3Utils.js
├── adminAuth.js       # Admin route protection
├── db.js              # Sequelize DB config
├── index.js           # Main server file
├── .env               # Environment variables
└── package.json
💡 License
This project is built for academic and learning purposes. Modify and use freely with attribution.

🙌 Contributors
Developed by Jagadish and team.
