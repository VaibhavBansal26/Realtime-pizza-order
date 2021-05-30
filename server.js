
require('dotenv').config()
const express = require('express')

const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')

const PORT = process.env.PORT || 5000

const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport = require('passport')
const Emitter = require('events')
//Database Connection

//CONFIG FILE
const uri = 'mongodb+srv://V_Bansal:kritisanon14@cluster0.hljid.mongodb.net/pizza-app?retryWrites=true&w=majority'

//MONGO DB CONNECTION
mongoose.connect(uri,{
    useNewUrlParser : true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology: true
}).then(con => {
    console.log("Connection is established")
})

const connection = mongoose.connection;
connection.once('open',() => {
    console.log("yeah connected... ");
}).catch(err =>{
    console.log('Connection failed...')
})



//session store
// let mongoStore = new MongoDbStore({
//     mongooseConnection:connection,
//     collection:'sessions'
// })

//Event Emitter
const eventEmitter = new Emitter()
//App binding
app.set('eventEmitter',eventEmitter)


//session
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave:false,
    store:MongoDbStore.create({
        client:connection.getClient(),
        mongoUrl:uri
    }),
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24}
}))

//Passport config
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
//Assets
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(express.json())
//Global middleware
app.use((req,res,next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

//Set Template Engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

//Routes
require('./routes/web')(app)

const server = app.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`)
})

//Socket

const io = require('socket.io')(server)
io.on('connection',(socket) =>{
    console.log(socket.id)
    socket.on('join',(orderId)=>{
        console.log(orderId)
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})