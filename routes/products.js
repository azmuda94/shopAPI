const {Product} = require('../models/product');
const {TypeProduct,typeProduct} = require('../models/typeProduct');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/typeproduct`, async (req, res) =>{
    let typeUrl=req.query.url;
    let typeId=req.query.id;
    let typeproduct

    let productList;
    let query;

    if(typeof typeId === "undefined")
    {
        query = {url:typeUrl};
        typeproduct=await TypeProduct.findOne((query));
        typeId=typeproduct
    }

    query = {typeProduct:typeId};

    productList = await Product.find((query)).populate('typeProduct');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(productList);

})


router.get(`/`, async (req, res) =>{
    const productList = await Product.find().populate('typeProduct');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(productList);
})

router.get('/:id', async(req,res)=>{
    const product = await Product.findById(req.params.id).populate('typeProduct');

    if(!product) {
        res.status(500).json({message: 'The type product with the given ID was not found.'})
    } 
    res.status(200).send(product);
})


router.post('/', async (req,res)=>{
    const typeProduct = await TypeProduct.findById(req.body.typeProduct);
    if(!typeProduct) return res.status(400).send('Invalid product type')

    let product = new Product({
        name: req.body.name,
        size: req.body.size,
        description: req.body.description,
        user: req.body.user,
        typeProduct: req.body.typeProduct,
        mainFile: req.body.mainFile,
    })
    product = await product.save();

    if(!product)
        return res.status(400).send('the product cannot be created!')

    res.send(product);
})

router.delete('/:id', (req, res)=>{
    TypeProduct.findByIdAndRemove(req.params.id).then(typeProduct =>{
        if(typeProduct) {
            return res.status(200).json({success: true, message: 'the product type is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product type not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})


module.exports =router;