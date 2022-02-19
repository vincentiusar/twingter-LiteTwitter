const mongoose = require('mongoose');
const uri = 'mongodb+srv://Vincentius:doomhammer@mydatabase.gglvt.mongodb.net/Twingter'
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

// // add 1 data (testing)
// const contact_1 = new Contact({
//     nama: 'coba insert',
//     noHP: '08787878787',
//     email: 'coba@gmail.com',
// })
// // simpan
// contact_1.save().then(function (contact) { console.log(`Insert Succeed \n ${contact}`) })

