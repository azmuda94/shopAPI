const mongoose = require('mongoose');

const product=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    typeProduct:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypeProduct',
        required:true
    },
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:false
    },
    mainFile:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required:false
    },
    size: {
        type: String,
        required:false
    },

   
});

product.virtual('id').get(function () {
    return this._id.toHexString();
});

product.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product',product);
exports.product=product;