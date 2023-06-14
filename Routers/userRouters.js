const userRouter = require('express').Router()
const User = require('../Models/User')
const bcrypt = require('bcrypt')

//signup

userRouter.post('/signup', async (req,res)=>{
    try {
        let user = await User.findOne({email: req.body.email});
        if(user) return res.status(409).json({message: "Email already exits"});
    
        //generate hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
        //new user updation
        user = await new User({
               name : req.body.name,
               email : req.body.email,
               password : hashedPassword 
            }).save();  

        res.status(201).send(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})


//login

userRouter.post('/login', async (req,res)=>{
    try {
        //email validation
        const user = await User.findOne({email: req.body.email})
        if(!user) return res.status(400).json({message: "Invalid Credentials"})
        
        //password validation
        const validatePassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validatePassword) return res.status(400).json({message: "Invalid Credentials"})

        res.status(201).send(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})


//GET USERS

userRouter.get("/", async(req,res)=>{
    try {
        const users = await User.find({isAdmin: false}).populate("orders");
        res.status(200).json(users)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//get user orders

userRouter.get('/:id/orders', async(req,res)=>{
    const {id} = req.params;
    try {
        const user = await User.findById(id).populate('orders');
        res.json(user.orders)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

//update user notifications
userRouter.post('/:id/updateNotifications', async (req,res)=>{
    const {id} = req.params;
    try {
        const user = await User.findById(id)
        user.notifications.forEach((notif)=>{
            notif.status = "read"
        });
        user.markModified('notifications');
        await user.save()
        res.status(200).send()
    } catch (error) {
        res.status(400).send(error.message)
    }
})


module.exports = userRouter;