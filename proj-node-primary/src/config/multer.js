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