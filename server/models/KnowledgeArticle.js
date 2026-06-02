const mongoose = require("mongoose");

const knowledgeArticleSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      content: {
        type: String,
        required: true,
      },

      category: {
        type: String,
        default: "General",
      },

      tags: [String],

      createdBy: {
        type: String,
        default: "System",
      },

      views: {
        type: Number,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "KnowledgeArticle",
  knowledgeArticleSchema
);