const mongoose = require('mongoose');

const user=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean
    },
    
   
});

user.virtual('id').get(function () {
    return this._id.toHexString();
});

user.set('toJSON', {
    virtuals: true,
});


exports.User = mongoose.model('User', user);
exports.userSchema = user;