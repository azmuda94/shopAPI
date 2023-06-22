const express = require('express');
const {File} = require('../models/file');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const {Storage} = require('@google-cloud/storage');
const storages = new Storage();


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
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
           /// res.status(200).send("Success");
            
            
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
            return res.status(500).send('The file cannot be created')
        
            res.send(file);
            
          });
          blobStream.end(req.file.buffer);
          
        } else throw "error with img";
      } catch (error) {
        res.status(500).send(error);
      }

  });



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid) {
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) =>{
    const fileList = await File.find();

    if(!fileList) {
        res.status(500).json({success: false})
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


router.get(`/:id`, async (req, res) =>{
    const file = await File.findById(req.params.id);

    if(!file) {
        res.status(500).json({success: false})
    } 
    res.send(file);
})


router.post(`/`, uploadOptions.single('img'), async (req, res) =>{
   
    const img = req.file;
    if(!img) return res.status(400).send('No image in the request')

    const imgName = img.filename
    const imgExt=img.mimetype
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let file = new File({
        name: imgName,
        ext: imgExt,
        isActive: true,
        product:req.body.product,
        src: `${basePath}${imgName}`,// "http://localhost:3000/public/upload/image-2323232"
        
    })

    file = await file.save();

    if(!file) 
    return res.status(500).send('The file cannot be created')

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