const mongoose = require('mongoose');

const ChatbotSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"]},
    name: {type: String, required: [true, "can't be blank"]},
    description: {type: String, required: [true, "can't be blank"]},
    role: {type: String, enum:["Father", "Son"], ref: 'Role', required: [true, "can't be blank"]},
    intents: {type: [mongoose.Schema.Types.ObjectId], ref: 'Intent'},
    updated: {type: Boolean, default: false}
}, {timestamps: true})

ChatbotSchema.methods.cleanup = function() {
    return {
        id: this._id,
        name: this.name,
        owner: this.owner,
        role: this.role,
        intents: this.intents,
        updated: this.updated
    }
}

module.exports = mongoose.model('Chatbot', ChatbotSchema)