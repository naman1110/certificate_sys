const express= require('express');
const app=express();
const path = require("path");
const mime = require('mime');
const multer = require('multer');
const fs = require('fs');
const sha256 = require('sha256');
const Web3 = require('web3');
const abi=require('./abi.json');
const qr = require('qr-image');
const QRCode = require('qrcode');
const qrCode = require('qrcode-reader');
const Jimp = require("jimp");




const port=process.env.PORT || 3000

app.use(express.static('public'));
app.use(express.urlencoded())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




   app.get('/', async (req, res)=> {
    res.render('index.pug', { title: 'issue '});
  })


function calculateHash(data) {
    return sha256(data);
  }
  
  const contractAddress = '0xeA054006DFb3a8067c7c843e8ca8e15a6928eC8c'; 
  async function web3i(){
   
   
    const web3 = await new Web3(new Web3.providers.HttpProvider('https://bsc-testnet.publicnode.com'));
     
    // Contract ABI and address
    const contractABI = abi; 
    
    
    // Instantiate the smart contract
    const contract = await new  web3.eth.Contract(contractABI, contractAddress);
    
      
    return contract

}

async function confirm(tx){
    const web3 = await new Web3(new Web3.providers.HttpProvider('https://bsc-testnet.publicnode.com'));
    
    const account = "0xda61506526b1257547ede6e61ca4b5fcd490028b";
    const gasPrice = await web3.eth.getGasPrice();
    
    const encodedTx = tx.encodeABI();
    
    const nonce = await web3.eth.getTransactionCount(account);
    
    const transactionObject = {
      from: account,
      to: contractAddress,
      gasPrice: gasPrice,
      gas: web3.utils.toHex(1000000), // Set an appropriate gas value
      data: encodedTx,
      nonce: nonce
    };
  
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, '2172a2f826f98e3ab06b0a544c2d7af610946d59d84644c42c0676dc8eec687c'); // Replace with your private key
    const ok=await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
    hash=signedTransaction.transactionHash;

    return hash;

}


 app.post('/',async function (req, res) {
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
        
         
         
         // Set the appropriate response headers for the image download
         res.set({
           'Content-Type': 'application/octet-stream',
           'Content-Disposition': 'attachment; filename="qrCode.png"'
         });
         
      
         
         res.send(Buffer.from(qrCodeImage, 'binary'));
         res.end();
         
             
        
      
     }) 

 app.get('/verify',async function (req, res) {
         res.render('Verify.pug', { title: 'Verify' });
     })

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
    
    async function fileFromPath(filePath) {
      const content = await fs.promises.readFile(filePath)
      const type = mime.getType(filePath)
      console.log(type);
      return new File([content], path.basename(filePath), { type })
    }
    
  app.post('/verify',upload.single('image'),async (req,res)=>{
   
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  
   file =await req.file.path;
   const buffer = await fs.readFileSync(__dirname +'/'+ file);
  const ip=__dirname +'/'+ file;
  console.log(ip);
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
})

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:3000`)
  })
  
