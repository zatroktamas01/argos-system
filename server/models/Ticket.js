const mongoose = require("mongoose");

const commentSchema =
  new mongoose.Schema({
    text: String,

    author: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const activitySchema =
  new mongoose.Schema({
    type: String,

    message: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

const ticketSchema =
  new mongoose.Schema(
    {
      ticketId: {
        type: String,
        unique: true,
        required: true,
      },

      title: String,

      category: String,

      priority: String,

      status: {
        type: String,
        default: "Open",
      },

      assignedTo: {
        type: String,
        default: "Unassigned",
      },

      likelyCause: String,

      slaDueAt: Date,

      comments: [
        commentSchema,
      ],

      activities: [
        activitySchema,
      ],
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Ticket",
    ticketSchema
  );