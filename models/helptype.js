var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var HelpSchema = new Schema({
	type: { type: String, required: true },
});
