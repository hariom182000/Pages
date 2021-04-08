const Book =require('../models/book')
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})
const {cloudinary}=require('../cloudinary/index')

module.exports.index =async(req,res)=>{
    const books=await Book.find({});
     res.render('books/index',{books})
}
module.exports.renderNewForm=(req,res)=>{
    res.render('books/new')
}

module.exports.createBook=async (req,res,next)=>{
    
    const geoData=await geocoder.forwardGeocode({
        query:req.body.book.location,
        limit:1
    }).send()
    //res.send(geoData.body.features[0].geometry.coordinates)
    //if(!req.body.book) throw new ExpressError('Invalid Book Data',400);
    const book=await new Book(req.body.book)
    book.geometry=geoData.body.features[0].geometry
    book.images=req.files.map(f=>({url:f.path,filename:f.filename}))
    book.owner=req.user._id;
    await book.save()
    //console.log(book)
    req.flash('success','successfully added a book!')
    res.redirect(`/books/${book._id}`)
    
   
    
}
module.exports.showBook=async (req,res)=>{
    const book=await Book.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
}).populate('owner')
    //console.log(book)
    if(!book){
        req.flash('error','book not found!')
        return res.redirect('/books')
    }
    res.render('books/show',{book})
}

module.exports.renderEditForm=async(req,res)=>{
    const book=await Book.findById(req.params.id)
    if(!book){
        req.flash('error','book not found!')
        return res.redirect('/books')
    }
    res.render('books/edit',{book})
}
module.exports.updateBook=async(req,res)=>{
    const {id}=req.params;
    //console.log(req.body)
    const book=await Book.findByIdAndUpdate(id,{...req.body.book})
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    book.images.push(...imgs)
    await book.save()
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
           await  cloudinary.uploader.destroy(filename)
        }
        await book.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    
    req.flash('success','Successfully updated  book!')
    res.redirect(`/books/${book._id}`)

}

module.exports.deleteBook=async (req,res)=>{
    const {id}=req.params;
    await Book.findByIdAndDelete(id);
    res.redirect('/books')
}