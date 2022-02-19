const mongoose = require('mongoose');

const User = mongoose.model('User', {
    id: { type: String, require: true },
    nama: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    address: { type: String },
    gender: { type: String },
    prfpict: { type: String },
    feeds: [String],
})

module.exports = {User};