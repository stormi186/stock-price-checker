var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ComparisonDataSchema = new Schema({
  stocks: { type: Array },
  stockData: { type: Array }
}, { versionKey: false });

var ComparisonData = mongoose.model('ComparisonData', ComparisonDataSchema);

module.exports.ComparisonData = ComparisonData;