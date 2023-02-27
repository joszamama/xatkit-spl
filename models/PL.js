const mongoose = require('mongoose');

const PLSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, "can't be blank"]},
    title: { type: String, validate: [/^\S*$/, 'Title cannot contain spaces'], required: [true, "can't be blank"], index: true },
    description: { type: String, required: [true, "can't be blank"] },
    mode: { type: String, enum: ['LeafOnly', 'LeafAndBranch'], default: "LeafOnly", required: [true, "can't be blank"] },
    location: { type: String, required: [true, "can't be blank"] },
}, { timestamps: true })

PLSchema.methods.cleanup = function () {
    return {
        id: this._id,
        owner: this.owner,
        title: this.title,
        description: this.description,
        mode: this.mode,
        location: this.location,
    }
}

module.exports = mongoose.model('PL', PLSchema)