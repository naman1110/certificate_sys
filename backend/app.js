const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); 
const app = express();
const port = process.env.PORT || 8000;
const pdf = require('pdf-lib');
 const { PDFDocument ,Rectangle} = pdf;
const fs = require('fs');
const calculateHash = require('./calculateHash');
const web3i = require('./web3i');
const confirm = require('./confirm');
const qr = require('qr-image');
const QRCode = require('qrcode');
const qrCode = require('qrcode-reader');


var pdfBytes;

app.use(cors())
// Set up multer storage and file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Set the destination where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

var qrX ,qrY,qrWidth,qrHeight;



async function addLinkToPdf(inputPath, outputPath, linkUrl,qrCode,combinedHash) {

  const existingPdfBytes = fs.readFileSync(inputPath);

  const pdfDoc = await pdf.PDFDocument.load(existingPdfBytes);

  const page = pdfDoc.getPage(0);

  const width = page.getWidth();
  const height = page.getHeight();


  page.drawText(linkUrl, {
    x: 20, 
    y: 50,
    size: 8
  });

  page.drawText(combinedHash, {
    x: 5, 
    y: 10,
    size: 3
  });

  //Adding qr code
  const pdfDc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(qrCode);
  const pngDims = pngImage.scale(0.3);
  
  
  page.drawImage(pngImage, {
    x: width - pngDims.width  -  75,
    y: 75,
    width: pngDims.width,
    height: pngDims.height,
  });
   qrX = width - pngDims.width - 75;
   qrY = 75;
   qrWidth = pngDims.width; 
   qrHeight = pngDims.height;

   

   pdfBytes = await pdfDoc.save();

   fs.writeFileSync(outputPath, pdfBytes);
  return pdfBytes;

   

}

// POST route to handle file upload and form data processing
app.post('/api/upload', upload.single('pdfFile'), async (req, res) => {
 

  // form data
  // const data=fs.readFileSync(__dirname +'/'+ req.file.path);
  const certificateId = req.body.certificateId;
  const name = req.body.name;
  const courseName = req.body.courseName;
  const issueDate = req.body.issueDate;
  const issuerAuthority = req.body.issuerAuthority;

  console.log(certificateId);

  const fields = {

    certificateId: req.body.certificateId,
    name: req.body.name,
    courseName: req.body.courseName,
    issueDate: req.body.issueDate,
    issuerAuthority: req.body.issuerAuthority
  };
  const hashedFields = {};
  for (const field in fields) {
      hashedFields[field] =  calculateHash(fields[field]);
  }
  const combinedHash =  calculateHash(JSON.stringify(hashedFields));
  
  //Blockchain processing.
  const contract =  await web3i();
  
  const tx = contract.methods.issue(fields.certificateId, combinedHash);

  hash = await confirm(tx);
  
  console.log(hash);

  // qr code processing.
  const qrCodeData = JSON.stringify({ transactionData: hash, fields });
  const qrCodeImage = await QRCode.toBuffer(qrCodeData, { errorCorrectionLevel: 'H' });



  file =req.file.path;
  const outputPdf = 'output.pdf';
  const linkUrl = `https://testnet.bscscan.com/tx/${hash}`;

  
    const opdf= await addLinkToPdf(__dirname +'/'+ file, outputPdf, linkUrl,qrCodeImage,combinedHash);
    console.log(opdf);
    const pdfBlob =  new Blob([opdf], {type: 'application/pdf'});
    console.log(pdfBlob.size);

    const filename = 'certificate.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="'+filename+'"');
    
    res.download(pdfBlob, filename);
});

app.post('/api/verify', upload.single('pdfFile'), async (req, res) => {
  file =req.file.path;
  
  const existingPdfBytes = fs.readFileSync(__dirname +'/'+ file);

  const PDFExtract = require('pdf.js-extract').PDFExtract;
  const pdfExtract = new PDFExtract();
  
  const buffer = fs.readFileSync(__dirname +'/'+ file);

let extractedData;
var options={};

await new Promise(resolve => {
  pdfExtract.extractBuffer(buffer, options, async (err, data) => {
    if (err) throw err;
    extractedData = data;
    resolve();
  });
});

const combinedHash = extractedData.pages[0].content[extractedData.pages[0].content.length - 1].str;


console.log(combinedHash);
const  contract =await  web3i();
const val = await contract.methods.verify(combinedHash).call();
console.log(val);

if(val){
res.send(`verified`);}
else{res.send(`Not correct certificate`);}



});
// Serve static files from the uploads directory (optional, if needed for file access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Start the server
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
