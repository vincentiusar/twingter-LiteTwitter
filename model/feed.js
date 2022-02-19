const mongoose = require('mongoose');

const feed = mongoose.model('feed', {
    id: { type: String, require: true },
    nama: { type: String, require: true },
    email: { type: String, require: true },
    pict: { type: String },
    describe: { type: String },
})

module.exports = {feed};