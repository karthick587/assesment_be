const mongoose = require("mongoose");
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
const UserSchema = new mongoose.Schema({
    PhoneNumber: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        select: false
    },
    name: {
        type: String,
    },
    email: {
        type: String
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'role',
            autopopulate: true,
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    ,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
    ,
    updatedAt: {
        type: Date,
    },
});


UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.validatePassword = async function validatePassword(data) {
    // Use findOne to include the password field in the query result
    const user = await this.model('user').findOne({ _id: this._id }).select('+password');
    if (!user) {
        throw new Error('User not found');
    }
    return bcrypt.compare(data, user.password);
};


// Add autopopulate plugin to the schema
UserSchema.plugin(require('mongoose-autopopulate'));

const collectionName = 'user';

module.exports = mongoose.model('user', UserSchema, collectionName);