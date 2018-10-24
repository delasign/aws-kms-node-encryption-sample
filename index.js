var aws = require('aws-sdk')
require('dotenv').config();

exports.handler = function(event, context, callback) {

    // encrypt(event.body.text, function(err, res){
    //     if(err) {
    //       callback(err, null);
    //     }
    //     else {
    //       decrypt(res, function(err, res){
    //         if(err){
    //           callback(err, null);
    //         }
    //         else {
    //           callback(null, res);
    //         }
    //       })
    //     }
    // });

    encrypt(event.body.text)
    .then((res) => {
      decrypt(res)
      .then((res) => {
        callback(null, res);
      })
      .catch((err) => {
        callback(err, null);
      });
    })
    .catch((err) => {
      callback(err, null);
    });

};

function encrypt(buffer) {
  const kms = new aws.KMS({
      accessKeyId: process.env.accessKeyId, //credentials for your IAM user
      secretAccessKey: process.env.secretAccessKey, //credentials for your IAM user
      region: process.env.awsRegion
  });
  return new Promise((resolve, reject) => {
      const params = {
          KeyId: process.env.kmsKeyId, // The identifier of the CMK to use for encryption. You can use the key ID or Amazon Resource Name (ARN) of the CMK, or the name or ARN of an alias that refers to the CMK.
          Plaintext: buffer// The data to encrypt.
      };
      kms.encrypt(params, (err, data) => {
          if (err) {
              reject(err);
              callback(err, null);
          } else {
              console.log("SUCCESS");
              console.log("ENCRYPTED : " + buffer + " TO : " + data.CiphertextBlob);
              resolve(data.CiphertextBlob);
          }
      });
  });
}

function decrypt(buffer) {
  console.log("DECRYPTING !");
    const kms = new aws.KMS({
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
        region: process.env.awsRegion
    });
    return new Promise((resolve, reject) => {
        const params = {
            CiphertextBlob: buffer// The data to dencrypt.
        };
        kms.decrypt(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                console.log("DECRYPTED : " + buffer + " TO : "+ data.Plaintext);
                resolve(data.Plaintext);
            }
        });
    });
}


// CRYPT LIB EXAMPLE
// var cryptLib = require('cryptlib')
// exports.handler = function(event, context, callback) {
//
//   var iv = cryptLib.generateRandomIV(16)
//   var key = cryptLib.getHashSha256('my secret key', 32)
//   var encryptedText = cryptLib.encrypt('This is the text to be encrypted', key, iv)
//
//   console.log("IV : ", iv);
//   console.log("ENCRYPTED TEXT : ", encryptedText);
//
//   var originalText = cryptLib.decrypt(encryptedText, key, iv);
//   console.log("ORIGINAL TEXT : ", originalText);
//
//   callback(null, 1);
// };
