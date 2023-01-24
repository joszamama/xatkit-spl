const mongoose = require('mongoose');

const NetworkSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: {type: String, required: [true, "can't be blank"], index: true},
    description: {type: String, required: [true, "can't be blank"]},
    father: {type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true},
    sons: [{type: [mongoose.Schema.Types.ObjectId], ref: 'Chatbot'}],
}, {timestamps: true})

NetworkSchema.methods.cleanup = function() {
    return {
        id: this._id,
        name: this.name,
        owner: this.owner,
        father: this.father,
        sons: this.sons,
        }
    }

module.exports = mongoose.model('Network', NetworkSchema)
