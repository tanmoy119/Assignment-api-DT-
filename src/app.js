const express = require('express');
const app = express();
app.use(express.json());
const main = require('./db/conn');
const multer = require('multer');
const ObjectId = require('mongodb').ObjectId;
const path = require('path');




//port
const port = process.env.PORT || 5000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/img/'));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const upload = multer({ storage: storage });

main().then((collection)=>{


//Routs... .. .

app.get("/api/v3/app/events", async(req, res)=>{
    try {
        
        
        if(req.query.id){
            const _id=new ObjectId(req.query.id);
            const gdata = await collection.findOne({_id});
            if (gdata) {
                res.status(200).send(gdata);   
            } else {
                res.status(204).send({message:"document not found",data:gdata});
            }
        }else{
            const type=req.query.type;
            const limit=parseInt(req.query.limit);
            const page= parseInt(req.query.page);

            const gdata = await collection.find({type}).limit(limit).toArray(function(err, results){
                console.log(results.length);
                if (results.length<=0) {
                    res.status(204).send({message:"document not found",data:results});
                } else {
                    res.status(200).send(results);   
                }
            });;      
        }
    } catch (err) {
        res.status(400).send({message:"bad request/error",error:err});
        console.log(err);
    }
});



app.post("/api/v3/app/events", upload.single('uploaded_file'), async(req, res)=>{
    try {
        const insertData = await collection.insertOne({
            type:req.body.type,
            uid:req.body.uid,
            name:req.body.name,
            tagline:req.body.tagline,
            schedule:req.body.schedule,
            description:req.body.description, 
            image:req.file.filename,
            moderator:req.body.moderator,
            category:req.body.category,
            sub_category:req.body.sub_category,
            rigor_rank:req.body.rigor_rank,
            attendees:req.body.attendees
        }); 
        res.status(201).send({message:"Event created Succesfully",EventID:insertData.insertedId});
    } catch (err) {
        res.status(400).send({message:"Event not created.",Error:err});
        console.log(err);
    }
});


app.put("/api/v3/app/events/:id", async(req, res)=>{
    try {
        const _id=new ObjectId(req.params.id); 
        const event = await collection.findOneAndUpdate({_id},{$set:req.body});
        if(event.lastErrorObject.updatedExisting){
            console.log();
            res.status(200).send({message:"Update successfully",event});
        }else{
            console.log("204");
            res.status(204).send({message:"No document found to delete"});
        }
        
    } catch (err) {
        res.status(401).send(err);
        console.log(err);
        
    }
})


app.delete("/api/v3/app/events/:id", async(req, res)=>{
    try {
        const _id=new ObjectId(req.params.id); 
        const event = await collection.findOneAndDelete({_id});
        if (event.lastErrorObject.updatedExisting) {
            res.status(200).send({message:"Deleted successfully",event});
        } else {
            res.status(204).send({message:"No document found to delete"});
           
        }
        
    } catch (err) {
        res.status(400).send({message:"bad request",error:err});
        console.log(err);
    }
})
});





app.listen(port,()=>{
    console.log(`listen at port-${port}`);
}) 