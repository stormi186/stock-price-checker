var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockDataSchema = new Schema({
  stock: { type: String },
  price: { type: String },
  likes: { type: Number, default: 0 },
  ips: { type: Array }
}, { versionKey: false });

var StockData = mongoose.model('StockData', StockDataSchema);

module.exports.StockData = StockData;