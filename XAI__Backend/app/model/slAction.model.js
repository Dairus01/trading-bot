const mongoose = require('mongoose');

const SLActionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'TSL', 'MSL', 'ReEntry'
  token: { type: String, required: true },
  price: { type: Number, required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

module.exports = mongoose.model('SLAction', SLActionSchema);
