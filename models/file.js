const mongoose = require('mongoose');

const file=mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    src: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    },
    ext: {
        type: String,
        required: true
    },
    product:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:false
    }
});

file.virtual('id').get(function () {
    return this._id.toHexString();
});

file.set('toJSON', {
    virtuals: true,
});


exports.File = mongoose.model('File',file);
exports.fileSchema=file;
