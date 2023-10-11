

const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 


router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-password');

    if(!userList) {
        res.status(500).json({success: false})
    } 

    res.status(201).json(userList)
})


router.get(`/count`, async (req, res) =>{
    const userCount = await User.count();

    if(!userCount) {
        res.status(500).json({success: false})
    } 

    res.status(201).json({count:userCount})
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-password');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.post('/register', async (req,res)=>{

    if (!req.body.password)
    {
        return res.status(400).send('Należy podać hasło!')

    }

    if (!req.body.name)
    {
        return res.status(400).send('Należy podać login!')

    }

    if (!req.body.email)
    {
        return res.status(400).send('Należy podać e-mail!')

    }

    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin,
  
    })

    const validUser = await User.findOne({name: req.body.name})
    
    if(validUser) {
        return res.status(400).send('The user name is locked');
    }

    user = await user.save();

    if(!user)
    {
        return res.status(400).send('the user cannot be created!')
    }    

    res.send(user);
})


router.post('/login', async (req,res) => {
    const user = await User.findOne({name: req.body.name})
    const secretKey= crypto.randomBytes(16).toString('hex');
    
    if(!user) {
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compareSync(req.body.password, user.password)) {
       
        res.status(201).send({secretKey}) 
    } else {
       res.status(400).send('password is wrong!');
    }

    
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(file) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.put('/',async(req, res)=>{

    const name=req.body.name;
    const oldpassword=req.body.oldpassword;
    const newpassword=req.body.newpassword;

    const user = await User.findOne({name});

    if(!user)
    {
        return res.status(404).json({success: false, error: 'Brak użytkownika.'}) ;
    }

    if(bcrypt.compareSync(oldpassword, user.password))
    {
        const updatedObject={
            name: name,
            password: bcrypt.hashSync(newpassword, 10)    
        }

        User.findOneAndUpdate({name:name},updatedObject).then(user =>{
            if(user) {
                return res.status(200).json({success: true, message: 'Hasło zostało zmienione!'});
            } else {
                return res.status(404).json({success: false , message:'Brak użytkownika.'});
            }
        }).catch(err=>{
        return res.status(500).json({success: false, error: err}) 
        })
    }else{
        return res.status(404).json({success: false, error: 'Błędne hasło.'}); 
    }
})




module.exports =router;