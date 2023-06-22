const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require("cors");
const mongoose = require('mongoose');

//// models 

const Product=require('./models/product.js');
const User=require('./models/user.js');

require('dotenv/config');

/// middleware

app.use(bodyParser.json())
app.use(express.json());
app.use(cors());
app.options('*', cors())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

const api_url=process.env.URL

//Routes
const usersRoutes = require('./routes/users');
const filesRoutes = require('./routes/files');
const typeProductsRoutes = require('./routes/typeProducts');
const productsRoutes = require('./routes/products');
//const testRoutes = require('./routes/test');


app.use(`${api_url}/users`, usersRoutes);
app.use(`${api_url}/files`, filesRoutes);
app.use(`${api_url}/typeproducts`, typeProductsRoutes);
app.use(`${api_url}/products`, productsRoutes);
//app.use(`${api_url}/test`, testRoutes);

mongoose.connect(process.env.CONNECTION_DB)
.then(()=>{
    console.log('DB connection succes.')
})
.catch(()=>{
    console.log('DB connection error.')
})

app.post(`${api_url}/`, async function (req, res) {
    
    const test= new Test({
        name:req.body.name,
        count:req.body.number
    })
    
  test
  .save()
  .then(t=>{
    res.status(201).json(t);
  })
  
})


app.listen(process.env.PORT,()=>{
    console.log('Server started.')
});