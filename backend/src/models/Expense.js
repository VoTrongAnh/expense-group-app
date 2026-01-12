const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  title: String,
  amount: Number,
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  splits: [{ userId: String, share: Number }],
  date: { type: Date, default: Date.now }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', schema);
