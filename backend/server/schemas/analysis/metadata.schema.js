import mongoose from "mongoose";

const metadataSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    processingDuration: {
      type: Number,
      required: true,
      min: 0,
    },

    analysisVersion: {
      type: Number,
      default: 1,
      min: 1,
    },

    promptVersion: {
      type: String,
      default: null,
      trim: true,
    },

    fileType: {
      type: String,
      default: null,
      trim: true,
    },

    pageType: {
      type: String,
      default: null,
      trim: true,
    },

    pageTypeConfidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },

    isArticle: {
      type: Boolean,
      default: null,
    },

    urlMetadata: {
      title: {
        type: String,
        default: null,
        trim: true,
      },

      author: {
        type: String,
        default: null,
        trim: true,
      },

      publishedDate: {
        type: String,
        default: null,
        trim: true,
      },

      domain: {
        type: String,
        default: null,
        trim: true,
      },

      canonicalUrl: {
        type: String,
        default: null,
        trim: true,
      },

      siteName: {
        type: String,
        default: null,
        trim: true,
      },

      excerpt: {
        type: String,
        default: null,
        trim: true,
      },

      language: {
        type: String,
        default: null,
        trim: true,
      },
    },
  },
  {
    _id: false,
  },
);

export default metadataSchema;
