var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const Location = require('./location');
const HelpType = require('./helptype');
const { DateTime } = require('luxon');

var PostSchema = new Schema({
	phone: { type: Number, required: true, min: 10 },
	location: { type: Schema.Types.ObjectId, ref: Location, required: true },
	helpType: { type: Schema.Types.ObjectId, ref: HelpType, required: true },
	posted: { type: Date, default: Date.now() },
	description: { type: String, maxlength: 250 },
	user: { type: Schema.Types.ObjectId, ref: 'User' },
	verified: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

PostSchema.virtual('url').get(function () {
	return '/post/display-post/' + this._id;
});

PostSchema.virtual('postedDay').get(function () {
	return DateTime.fromJSDate(this.posted).toLocaleString(
		DateTime.DATETIME_MED
	);
});

module.exports = mongoose.model('Post', PostSchema);
