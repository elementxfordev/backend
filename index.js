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
    password : String
});

const contentSchema = new mongoose.Schema({
    html : String,
    css : String,
    js : String,
    category : String,
    username : String,
    postnumber : Number
});

const UserData = mongoose.model('UserData',contentSchema);
const User = mongoose.model('websiteUser',userSchema);

app.use(bodyParser.json());
app.use(cors());

app.post('/register',async (request,response) => {
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
    const user = {username,password,gmail};
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
    const js = request.body.js;
    const category = request.body.category;
    const userid = request.body.userid;
    const postnumber = request.body.postnumber;
    const userdata = new UserData({html,css,js,category,userid,postnumber});
    userdata.save();
    return response.json({message : "your creation saved successfully",
    html,css,js,category,userid,postnumber});
});

app.get('/getall',async (request,response) => {
    try
    {
        const data = await UserData.find({});
        return response.json({data});
    }catch(error)
    {
        return response.json({message : "error"});
    }
})

app.post('/update',verify,async (request,rsponse)=>{
    const html = request.body.html;
    const css = request.body.css;
    const js = request.body.js;
    const category = request.body.category;
    const username = request.body.userid;
    const postnumber = request.body.postnumber;
    let existingData = await UserData.findOne({postnumber});
    if(!existingData)
    {
        return express.response.json({message : "User not found"});
    }
    existingData.html = html;
    existingData.css = css;
    existingData.js = js;
    existingData.category = category;
    existingData.userid = userid;
    await existingData.save();
});

app.delete('/delete',verify,async (request,response) => {
    const postnumber = request.body.postnumber;
    const userid = request.body.userid;
    let existingData = await UserData.findOne({userid});
    if(existingData)
    {
        let existingPost = await UserData.findOneAndDelete({postnumber});
        if(!existingPost)
        {
            return response.json({message : "post not found"});
        }
        return response.json({message : "post deleted successfuly"});
    }
    return response.json({message : "invalid user id"});
});


app.listen(port,()=>{
    console.log(`Listening on port number ${port}`);
})