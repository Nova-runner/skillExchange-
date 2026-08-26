const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    message: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
