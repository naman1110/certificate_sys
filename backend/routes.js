const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const qr = require('qr-image');
const QRCode = require('qrcode');
const qrCode = require('qrcode-reader');
const Jimp = require('jimp');
const calculateHash = require('./calculateHash');
const web3i = require('./web3i');
const confirm = require('./confirm');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Destination directory for uploaded files
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext); // File name on disk
    },
  });
  const upload = multer({ storage });
  

router.get('/', async (req, res) => {
  res.render('index.pug', { title: 'issue ' });
});

router.post('/', async (req, res) => {
    const fields = {
        certificateId: req.body.certificateId,
        name: req.body.name,
        courseName: req.body.courseName,
        issueDate: req.body.issueDate,
        issuerAuthority: req.body.issuerAuthority
    };
    const hashedFields = {};
    for (const field in fields) {
        hashedFields[field] = await calculateHash(fields[field]);
    }
    const combinedHash = await calculateHash(JSON.stringify(hashedFields));

    const contract = await web3i();
    console.log(fields.certificateId);
    const tx = contract.methods.issue(fields.certificateId, combinedHash);
    

   
    hash = await confirm(tx);
    const qrCodeData = await JSON.stringify({ transactionData: hash, fields });
    const qrCodeUrl= await QRCode.toDataURL(qrCodeData, { errorCorrectionLevel: 'H' });
    

    const qrCodeImage = await qr.imageSync(qrCodeData, { type: 'png' });

 

    const url = `https://testnet.bscscan.com/${hash}`;

    const successMessage=`Success with hash: ${hash}, check on ${url}`;
    console.log(`Success with hash: ${hash}, check on ${url}`);  
   
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename="qrCode.png"'
    });
    
 
    
    res.send(Buffer.from(qrCodeImage, 'binary'));
    res.end();
    
});

router.get('/verify', async (req, res) => {
  res.render('Verify.pug', { title: 'Verify' });
});

router.post('/verify', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
      }
    
      
       file =await req.file.path;
       const buffer = await fs.readFileSync(__dirname +'/'+ file);
    
       var data;
       try {
      const image = await Jimp.read(buffer);
      const qrcode =await  new qrCode();
      const decodedValue = await new Promise((resolve, reject) => {
        qrcode.callback = (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        };
        qrcode.decode(image.bitmap);
      });
       data = JSON.parse(decodedValue.result);
      console.log(data.fields);
    } catch (error) {
      console.error(error);
      return null;
    }
      
      
        const hashedFields = {};
         for (const field in data.fields) {
         hashedFields[field] = await calculateHash(data.fields[field]);
         }
         const combinedHash =await  calculateHash(JSON.stringify(hashedFields));
     
         const  contract =await  web3i();
         const val = await contract.methods.verify(combinedHash).call();
         console.log(val);
     
         if(val){
         res.send(`verified`);}
         else{res.send(`Not correct certificate`);}
});

module.exports = router;
