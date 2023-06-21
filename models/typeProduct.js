const mongoose = require('mongoose');

const typeProduct=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    url: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
});

typeProduct.virtual('id').get(function () {
    return this._id.toHexString();
});

typeProduct.set('toJSON', {
    virtuals: true,
});

exports.TypeProduct = mongoose.model('TypeProduct',typeProduct);
exports.typeProduct=typeProduct;