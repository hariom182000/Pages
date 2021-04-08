const Review =require('../models/review')
const Book =require('../models/book')

module.exports.createReview  =async (req,res)=>{
    const book=await Book.findById(req.params.id)
    const review=new Review(req.body.review)
    review.author=req.user._id
    book.reviews.push(review)
    await review.save()
    await book.save()
    req.flash('success','Created new review!')
    res.redirect(`/books/${book._id}`)
    //res.send('made it')
}
module.exports.deleteReview=async(req,res)=>{
    const {id,reviewId}=req.params;
    await Book.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success','successfully deleted review')
    res.redirect(`/books/${id}`)
}