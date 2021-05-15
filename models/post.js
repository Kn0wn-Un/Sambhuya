var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
	phone: { type: Number, required: true, min: 10 },
	location: { type: String, ref: 'Location', required: true },
	helpType: { type: String, ref: 'HelpType', required: true },
	posted: { type: Date, default: Date.now() },
	description: { type: String, maxlength: 250 },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
});

PostSchema.virtual('url').get(function () {
	return '/post/display-post/' + this._id;
});

PostSchema.virtual('name').get(function () {
	return this.helpType + ' in ' + this.location;
});

module.exports = mongoose.model('Post', PostSchema);
