const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
    job_title: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
