var mongoose = require('mongoose');

WordSchema = new mongoose.Schema({
	infinitive: String,
	forms : [String],
	currentForm: { type: Number, default: 0 },
	userAnswer: { type: String, default: '' },
	lastResult: { type:Boolean, default: true },
    score : { type: Number, default: 0 }
});

WordSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) return callback(err);
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};


module.exports = mongoose.model('Word', WordSchema);