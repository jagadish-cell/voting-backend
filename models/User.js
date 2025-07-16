const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    voter_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    aadhaar_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    face_descriptor: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    hasVoted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,  // 🆕 Default to false (User hasn't voted initially)
        allowNull: false
    }
});

module.exports = User;
