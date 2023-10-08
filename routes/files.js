const express = require('express');
const {File} = require('../models/file');
const {Product} = require('../models/product');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const storages = new Storage();

var MulterAzureStorage = require('multer-azure-storage')


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}


const multerst = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });

let projectId = "shopapi-390612"; // Get this from Google Cloud
let keyFilename = "mykey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storagest = new Storage({
  projectId,
  keyFilename,
});
const bucket = storagest.bucket(process.env.BUCKET_NAME); // Get this from Google Cloud -> Storage

////////////////// AZURE ////////////



const account = process.env.AZURE_ACCOUNT;
const accountKey =process.env.AZURE_ACCOUNT_KEY;
var containerName = process.env.AZURE_ACCOUNT_CONTAINER;

var multerAzure = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: accountKey,
    containerName: containerName,
    containerSecurity: 'blob',
  })
})



router.post("/uploadAzure", multerAzure.single("img"), async (req, res) => {
  const img = req.file;


  try {
      if (img) {         
        const fileName = img.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[img.mimetype];
        const fileNameNow=`${fileName}-${Date.now()}.${extension}`;

        const blob = bucket.file(fileNameNow);
        const blobStream = blob.createWriteStream();     

        blobStream.on("finish", async (item) => {

          if(!img) return res.status(400).send('No image in the request')

          const basePath = img.url;
      
          let file = new File({
              name: fileNameNow,
              ext: extension,
              isActive: true,
              product:req.body.product,
              src: `${basePath}`,// "http://localhost:3000/public/upload/image-2323232"
              
          })
      
          file = await file.save();
      
          if(!file) 
            return res.status(500).send('The file cannot be created');

          if (req.body.product && req.body.isMainFile)
          {             
            const product= await Product.findOneAndUpdate({_id:req.body.product},{mainFile:file.id});
            
            if(!product) 
              return res.status(500).send('The product cannot be updated');
          }            
      
          res.send(file);
          
        });
        blobStream.end(req.file.buffer);
        
      } else throw "error with img";
    } catch (error) {
      res.status(500).send(error);
    }

});

router.post("/upload", multerst.single("img"), async (req, res) => {
    const img = req.file;


    try {
        if (img) {         
          const fileName = img.originalname.split(' ').join('-');
          const extension = FILE_TYPE_MAP[img.mimetype];
          const fileNameNow=`${fileName}-${Date.now()}.${extension}`;

          const blob = bucket.file(fileNameNow);
          const blobStream = blob.createWriteStream();              
         
    
          blobStream.on("finish", async (item) => {

            if(!img) return res.status(400).send('No image in the request')

            const basePath = `${process.env.DISK_STORAGE_URL}/${process.env.BUCKET_NAME}/`;
        
            let file = new File({
                name: fileNameNow,
                ext: extension,
                isActive: true,
                product:req.body.product,
                src: `${basePath}${fileNameNow}`,// "http://localhost:3000/public/upload/image-2323232"
                
            })
        
            file = await file.save();
        
            if(!file) 
              return res.status(500).send('The file cannot be created');

           if (req.body.product && req.body.isMainFile)
            {             
              const product= await Product.findOneAndUpdate({_id:req.body.product},{mainFile:file.id});
              
              if(!product) 
                return res.status(500).send('The product cannot be updated');
            }            
        
            res.send(file);
            
          });
          blobStream.end(req.file.buffer);
          
        } else throw "error with img";
      } catch (error) {
        res.status(500).send(error);
      }

  });




router.get(`/`, async (req, res) =>{
    const fileList = await File.find().populate('product');

    if(!fileList) {
       return res.status(500).json({success: false})
    } 
    res.send(fileList);
})


router.get(`/product/:id`, async (req, res) =>{

    var ObjectId = mongoose.Types.ObjectId; 
 
    var query = { product: new ObjectId(req.params.id.toString()) };

    const fileList = await File.find((query));

    if(!fileList) {
        res.status(500).json({success: false})
    } 
    res.send(fileList);
})


router.get(`/forproject`, async (req, res) =>{

  var query = { product: null};

  const fileList = await File.find((query));

  if(!fileList) {
    return  res.status(500).json({success: false})
  } 
  res.send(fileList);
})

router.get(`/:id`, async (req, res) =>{

  if (typeof req.params.id!='number'){
   return res.status(500).json({success: false})
  }

    const file = await File.findById(req.params.id);

    if(!file) {
       return res.status(500).json({success: false})
    } 
    res.send(file);
})


router.delete('/:id', (req, res)=>{
    File.findByIdAndRemove(req.params.id).then(file =>{
        if(file) {
            return res.status(200).json({success: true, message: 'the file is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "file not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;