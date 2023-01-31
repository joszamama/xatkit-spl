const mongoose = require('mongoose');

const IntentSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"]},
    title: {type: String, required: [true, "can't be blank"], index: true},
    description: {type: String, required: [true, "can't be blank"]},
    training: {type: [String], required: [true, "can't be blank"]},
}, {timestamps: true})

IntentSchema.methods.cleanup = function() {
    return {
        id: this._id,
        owner: this.owner,
        title: this.title,
        training: this.training,
        chatbots: this.chatbots
    }
}

module.exports = mongoose.model('Intent', IntentSchema)