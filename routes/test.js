const express = require('express');
const multerDbx = require('multer-dropbox');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');
const router = express.Router();
const multer = require('multer');

const dbx = new Dropbox({
  accessToken: 'sl.Bgw5L49wWhtx8g_7Ab6OISHuNUtnIs2I49flFiifSIsLI8do-UtkN1D8-xAIevIJvAtdbugmc08gwzAaAbIVKLauRx_vszcVSzuBDGwOHNr55nYBl7zb4ovZNjLsZZmPzX2KZd8',
  fetch
});

const storage = multerDbx(
    // instance
    dbx,
    {
        path: function( req, file, cb ) {
            cb( null, '/multer-uploads/' + file.originalname );
        },
    });
  
  const uploadOptions = multer({ storage });


  router.post(`/`, uploadOptions.single('img'), async (req, res) =>{
   
    const img = req.file;
    console.log(img);
})



module.exports =router;