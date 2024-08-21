const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
    code: {
        type: String
    },
    codeName: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    ,createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    , updatedAt: {
        type: Date,
    }
});

const collectionName = 'role';

module.exports = mongoose.model('role', RoleSchema, collectionName);