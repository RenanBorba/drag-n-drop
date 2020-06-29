const mongoose = require ('mongoose');
const aws = require ('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const s3 = new aws.S3({});

const PostSchema = new mongoose.Schema({
  // nome original
  name: String,
  size: Number,
  // hash+nome
  key: String,
  url: String,
  // data/hora atual
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pré verificação p/caso não contiver url, adicionar local
PostSchema.pre('save', function() {
  if (!this.url) {
    this.url = `${ process.env.APP_URL }/files/${this.key}`;
  }
});

// Pré verificação p/remoção diretamente no AWS
PostSchema.pre('remove', function() {
  if(process.env.STORAGE_TYPE == 's3') {
    return s3.deleteObject({
      Bucket: 'upload-api-node',
      key: this.key
    }).promise()
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key));
  }
});

module.exports = mongoose.model('Post', PostSchema);