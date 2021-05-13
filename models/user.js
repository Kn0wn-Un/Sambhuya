var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: { type: String, required: true, maxLength: 100 },
	phone: { type: Number, required: true, min: 10 },
	email: { type: String, required: true },
	password: { type: String, required: true },
	posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.virtual('url').get(function () {
	return '/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
