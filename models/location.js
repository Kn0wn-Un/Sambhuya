var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	cityName: { type: String, required: true },
});

module.exports = mongoose.model('Location', LocationSchema);
