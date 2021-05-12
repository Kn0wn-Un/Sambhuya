var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
	name: { type: String, required: true, maxLength: 100 },
	phone: { type: Number, required: true, min: 10, max: 10 },
	email: { type: String, required: true },
	password: { type: String, required: true },
	about: {
		type: String,
		maxLength: 250,
	},
	posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

AuthorSchema.virtual('url').get(function () {
	return '/user/' + this._id;
});
