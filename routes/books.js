const express=require('express')
const router=express.Router()
const {BookSchema}=require('../schemas.js')
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const Book =require('../models/book')
const {isLoggedIn,isOwner,validateBook}=require('../middleware')
const books =require('../controllers/books')
const multer=require('multer')
const {storage}=require('../cloudinary')
const upload=multer({storage})


router.get('/',catchAsync(books.index))

router.get('/new',isLoggedIn,books.renderNewForm)

router.post('/',isLoggedIn,upload.array('image'),validateBook,catchAsync(books.createBook))

router.get('/:id',catchAsync(books.showBook))

router.get('/:id/edit',isLoggedIn,isOwner,catchAsync(books.renderEditForm))

router.put('/:id', isLoggedIn, isOwner, upload.array('image'), validateBook, catchAsync(books.updateBook))

router.delete('/:id',isLoggedIn,isOwner,catchAsync(books.deleteBook))


module.exports=router