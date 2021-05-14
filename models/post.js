var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
	phone: { type: Number, required: true, min: 10 },
	location: { type: String, ref: 'Location', required: true },
	helpType: { type: String, ref: 'HelpType', required: true },
	posted: { type: Date, default: Date.now() },
	description: { type: String, maxlength: 250 },
	userId: { type: Schema.Types.ObjectId, ref: 'User' },
});

PostSchema.virtual('url').get(function () {
	return '/post/' + this._id;
});

module.exports = mongoose.model('Post', PostSchema);
