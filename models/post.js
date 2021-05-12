var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
	phone: { type: Number, required: true, min: 10, max: 10 },
	location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
	helpType: { type: Schema.Types.ObjectId, ref: 'HelpType', required: true },
	posted: { type: Date, required: true },
});

PostSchema.virtual('url').get(function () {
	return '/post/' + this._id;
});
