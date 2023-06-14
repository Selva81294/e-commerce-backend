const stripeRouter = require('express').Router()
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET)

//create order

stripeRouter.post('/', async (req,res)=>{
    const {amount} = req.body
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "inr",
            payment_method_types: ['card']
        });
        res.status(200).json(paymentIntent)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = stripeRouter;