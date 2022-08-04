<div align="center">

# Projeto - API Node Armazenamento de Imagem

</div>

<br>

<div align="center">

[![Generic badge](https://img.shields.io/badge/Made%20by-Renan%20Borba-purple.svg)](https://shields.io/) [![Build Status](https://img.shields.io/github/stars/RenanBorba/drag-n-drop.svg)](https://github.com/RenanBorba/drag-n-drop) [![Build Status](https://img.shields.io/github/forks/RenanBorba/drag-n-drop.svg)](https://github.com/RenanBorba/drag-n-drop) [![made-for-VSCode](https://img.shields.io/badge/Made%20for-VSCode-1f425f.svg)](https://code.visualstudio.com/) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)

</div>

<br>

API REST de dados Back-end em Node.js MVC, desenvolvida para aplicação de armazenamento de imagem (Drag and drop).

<br><br>

## :rocket: Tecnologias
<ul>
  <li>Nodemon</li>
  <li>MongoDB</li>
  <li>Mongoose</li>
  <li>Conexão com Banco de Dados (Database)</li>
  <li>Routes</li>
  <li>Express</li>
  <li>Multer (Upload imagem)</li>
  <li>Model de Post de imagem</li>
  <li>Amazon AWS S3</li>
  <li>Dotenv Variáveis de ambiente (.env)</li>
</ul>

<br><br>

## :arrow_forward: Start
<ul>
  <li>npm install</li>
  <li>npm run dev / npm dev</li>
</ul>

<br><br><br>

## :mega: ⬇ Abaixo, as principais estruturas:

<br><br><br>
 
## src/routes.js
```js
const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');

const Post = require('./models/Post');

// HTTP Routes - GET, POST
routes.get('/posts', async (req, res) => {
  const posts = await Post.find();

  return res.json(posts);
});

routes.post('/posts', multer(multerConfig).single('file'), async (req, res) => {
  console.log(req.file);

  // destruturação
  const { originalname: name, size, key, location: url  = "" } = req.file;

  const post = await Post.create({
    // name: req.file.originalname,
    name,
    // size: req.file.size,
    size,
    // key: req.file.filename,
    key,
    url
  });

  return res.json(post);
});

routes.delete('/posts/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);

  await post.remove();

  return res.send();
});

module.exports = routes;
```

<br><br>

## models/Post.js
```js
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
```

<br><br>

## config/multer.js
```js
const multer = require('multer');
const path =  require('path');
const crypto = require('crypto');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, "..", "..", "tmp", "uploads"));
    },

    // hash anexado ao índice dos nomes
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        // repasse de erro ao multer
        if (err) cb(err);

        file.key =  `${hash.toString('hex')}-${file.originalname}`;

        cb(null, file.key);
      });
    }
  }),

  s3: multerS3({
    s3: new aws.S3(),
    bucket: 'upload-api-node',
    /* Permitir visualização de arquivo em tela,
    sem a necessidade de download */
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Permissão de leitura
    acl: 'public-read',
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        // repasse de erro ao multer
        if (err) cb(err);

        const fileName =  `${hash.toString('hex')}-${file.originalname}`;

        cb(null, fileName);
      });
    }
  })
};

module.exports = {
  // destino
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: storageTypes[process.env.STORAGE_TYPE],//s3, local -> variaveis ambiente

  limits: {
    // tamanho arquivo
    fileSize: 2 * 1024 * 1024,
  },
  // filtro tipo file
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo inválido.'));
    }
  }
};
```
