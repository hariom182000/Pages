if(process.env.NODE_ENV!=="production"){
    require('dotenv').config()
}

const express=require('express');
const path=require('path')
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const catchAsync=require('./utils/catchAsync')
const ExpressError=require('./utils/ExpressError')
const {BookSchema, reviewSchema}=require('./schemas.js')
const Book =require('./models/book')
const User=require('./models/user')
const methodOverride=require('method-override')
const Review =require('./models/review')
const mongoSanitize = require('express-mongo-sanitize');
const userRoutes=require('./routes/users')
const bookRoutes=require('./routes/books')
const reviewRoutes=require('./routes/reviews')
const helmet=require('helmet')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStragey=require('passport-local');
const MongoDBStore=require("connect-mongo")(session)


const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/book-store';
mongoose.connect(dbUrl,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected")
})


const app=express()
app.engine('ejs',ejsMate)

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(mongoSanitize())

const secret=process.env.SECRET||"thisshouldbeabettersecret!";

const store=new MongoDBStore({
    url:dbUrl,
    secret,
    touchAfter:24*60*60
})

store.on('error',function(e){
    console.log('session store error',e)
})
const sessionConfig={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet({contentSecurityPolicy:false}));


app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStragey(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success')
    res.locals.error=req.flash('error')
    next()
})


app.use('/',userRoutes)
app.use('/books',bookRoutes)
app.use('/books/:id/reviews',reviewRoutes)

app.get('/',(req,res)=>{
    res.render('home')
})

const port=process.env.PORT||3000
app.listen(port,()=>{
    console.log(`serving on port ${port}`)
})






app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {satatusCode=500,message="something went wrong"}=err
    if(!err.message) message="OH NO something went wrong!!"
    res.status(satatusCode).render('error',{err})
    //res.send("OH NO something went wrong!!")
})