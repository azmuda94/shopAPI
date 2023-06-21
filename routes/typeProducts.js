const {TypeProduct} = require('../models/typeProduct');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const typeProductList = await TypeProduct.find();

    if(!typeProductList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(typeProductList);
})

router.get('/:id', async(req,res)=>{
    const typeProduct = await TypeProduct.findById(req.params.id);

    if(!typeProduct) {
        res.status(500).json({message: 'The type product with the given ID was not found.'})
    } 
    res.status(200).send(typeProduct);
})

router.post('/', async (req,res)=>{
    let typeProduct = new TypeProduct({
        name: req.body.name,
        url: req.body.url,
        description: req.body.description,
        isActive: true
    })
    typeProduct = await typeProduct.save();

    if(!typeProduct)
        return res.status(400).send('the category cannot be created!')

    res.send(typeProduct);
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