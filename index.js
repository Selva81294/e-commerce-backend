const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const userRouter = require('./Routers/userRouters')
const productRouter = require('./Routers/productRouters')
const imageRouter = require('./Routers/imagesRouter')
const stripeRouter = require('./Routers/stripeRouter')
const { dataBaseConnection } = require('./connection')
const orderRouter = require('./Routers/orderRouter')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: "https://starlit-boba-48ae2d.netlify.app",
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
})

//middlewares
app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use("/users",userRouter)
app.use("/products", productRouter)
app.use("/images", imageRouter)
app.use("/create-payment", stripeRouter)
app.use("/orders", orderRouter)


//db connections:
dataBaseConnection()

server.listen(process.env.PORT, ()=>{
    console.log(`Server is up in PORT ${process.env.PORT}`)
})

//socket.io
app.set('socketio', io)
