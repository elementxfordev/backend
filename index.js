const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const port = 4040;
const secret = "634659";

const verify = (request,response,next) => {
    try 
    {
        const auth = request.headers.authorization;
        const token = auth.replace('Bearer ','');
        const json = jwt.verify(token,secret);
        request.user = json;
        next();
    }catch(error)
    {
        response.json({message : "Invalid Token"});
    }
}

mongoose.connect('mongodb+srv://karanprajapat824:karanprajapat824@cluster0.xescpid.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser : true,
    useUnifiedTopology : true
});

const userSchema = new mongoose.Schema({
    username : String,
    gmail : String,
    password : String,
});


const contentSchema = new mongoose.Schema({
    html : String,
    css : String,
    category : String,
    username : String,
});

const Content = mongoose.model('content',contentSchema);
const User = mongoose.model('websiteUser',userSchema);



app.use(bodyParser.json());
app.use(cors());

app.post('/userInfo',verify,async (request,response)=>{
    const username = request.body.username;
    console.log(username);
    const data = await Content.find({username : username});
    if(data)
    {
        response.status(200).json({data});
    }
})

app.post('/register',async (request,response) => {
    const fullname = request.body.fullname;
    const username = request.body.username;
    const gmail = request.body.gmail;
    const password = request.body.password;
    let existingUser = await User.findOne({username});
    if(existingUser)
    {
        return response.json({message : "Username is already exist"});
    }
    existingUser = await User.findOne({gmail});
    if(existingUser)
    {
        return response.json({message : "Gmail is already exist"});
    }
    const user = {username,password,gmail,fullname};
    const newUser = new User(user);
    newUser.save();
    const token = jwt.sign(user,secret);
    response.json({
        message : "User register successfully",
        token
    });
} )

app.post('/login',async (request,response) => {
    const username = request.body.username;
    const password = request.body.password;
    let existingUser = await User.findOne({username});
    if(!existingUser)
    {
        return response.json({message : "Invalid Username"});
    }
    if(existingUser.password === password)
    {
        const user = {username,password,gmail : existingUser.gmail};
        const token = jwt.sign(user,secret);
        return response.json({message : "login successfully ",token});
    }
    else 
    {
        return response.json({message : "Invalid password"});
    }
});

app.post('/create',verify,(request,response)=>{
    const html = request.body.html;
    const css = request.body.css;
    const category = request.body.category;
    const username = request.body.username;
    const newContent = new Content({html,css,category,username});
    newContent.save();
    return response.status(200).json({message : "your creation saved successfully",
    html,css,category,username});
});

app.get('/getall', async (request, response) => {
    try {
      const pageSize = 15;
  
      const data = await Content.aggregate([
        { $match: { category: { $nin: ["Forms", "Cards"] } } },
        { $sample: { size: pageSize } },
     ]);

      return response.status(200).json({ data });
    } catch (error) {
      console.error(error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.post('/update',verify,async (request,rsponse)=>{
    const html = request.body.html;
    const css = request.body.css;
    const _id = request.body.id;
    let existingData = await Content.findOne({_id});
    if(!existingData)
    {
        return express.response.json({message : "User not found"});
    }
    existingData.html = html;
    existingData.css = css;
    await existingData.save();
});

app.delete('/delete',verify,async (request,response) => {
    const _id = request.body._id;
    let existingData = await Content.findOne({_id});
    if(existingData)
    {
        let existingPost = await Content.findOneAndDelete({_id});
        if(!existingPost)
        {
            return response.json({message : "post not found"});
        }
        return response.json({message : "post deleted successfuly"});
    }
    return response.json({message : "invalid user id"});
});

app.get('/getButtons',async (request,response) =>{
    const pageSize = 15;
  
      const data = await Content.aggregate([
        { $match: { category: "Buttons" } },
        { $sample: { size: pageSize } },
     ]);

    response.json({data});
});

app.get('/getForms',async (request,response) =>{
    const data = await Content.find({category : "Forms"});
    response.json({data});
});

app.get('/getCards',async (request,response) =>{
    const data = await Content.find({category : "Cards"});
    response.json({data});
});

app.get('/getCheckBoxes',async (request,response) =>{
    const data = await Content.find({category : "CheckBoxes"});
    response.json({data});
});

app.get('/getInputs',async (request,response) =>{
    const data = await Content.find({category : "Inputs"});
    response.json({data});
});

app.get('/getLoaders',async (request,response) =>{
    const data = await Content.find({category : "Loaders"});
    response.json({data});
});

app.get('/getRadioButtons',async (request,response) =>{
    const data = await Content.find({category : "RadioButtons"});
    response.json({data});
});

app.get('/getToggleSwitches',async (request,response) =>{
    const data = await Content.find({category : "ToggleSwitches"});
    response.json({data});
});

app.get('/getOthers',async (request,response) =>{
    const data = await Content.find({category : "Others"});
    response.json({data});
});

app.post('/getElementById', async (request, response) => {
    const _id = request.body._id;
    const data = await Content.find({_id : _id});
    if(data)
    {
        response.status(200).json({data});
    }
    else 
    {
        response.json({message : "Element not found"});
    }
    
  });

app.listen(port,()=>{
    console.log(`Listening on port number ${port}`);
})