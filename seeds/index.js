const mongoose=require('mongoose');
const Book =require('../models/book');
const data=require('./book.json')
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:'pk.eyJ1IjoiaGFyaW9tMTgyMDAwIiwiYSI6ImNrbjJxdmNsYTFhN3Qyb25uNjB1czN4cGUifQ.UbK-CpNw8J3d5brQGAF1Uw'})

mongoose.connect('mongodb://localhost:27017/book-store',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected")
})


const axios =require('axios');
const seedDB=async ()=>{
    await Book.deleteMany({});

    for(let i=0;i<300;i++){
        var name=String(data[i].title).split(" ").join("");
        var Url
        await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${name}`)
        .then(res=>{
            //console.log(res.data.items[0].volumeInfo.imageLinks)
           
            //url=res.data.items[0].volumeInfo.imageLinks.thumbnail;
            try
            {
                Url=res.data.items[0].volumeInfo.imageLinks.thumbnail;
            }
            catch(e)
            {
                Url="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.ytimg.com%2Fvi%2Fy05gGn43TjY%2Fmaxresdefault.jpg&f=1&nofb=1"
    
            }

        })

        const geoData=await geocoder.forwardGeocode({
            query:data[i].country,
            limit:1
        }).send()
        var t
         t="Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quidem est inventore doloribus quisquam laborum distinctio sed odit officia, cumque consequuntur rerum nam animi perferendis natus qui modi error impedit perspiciatis?"
        const b= new Book({
            title:String(data[i].title),
            images:[{url:Url,filename:'pages/htx2mjc0r2hbfraxtksu'}],
            author:String(data[i].author),
            description:t,
            geometry:geoData.body.features[0].geometry,
            //geometry:{coordinates:[77.21667,28.66667],type:"Point"},

            location:String(data[i].country),
            owner:'605dab9615476d48fc4fce68',
            pages:data[i].pages       
        })
        await b.save()
        //console.log(data[i].pages)
        
        
    }
}
seedDB().then(()=>{
    mongoose.connection.close();
})