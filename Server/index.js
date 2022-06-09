const express = require('express');
const app = express();
const mongoose = require('mongoose');
const clc = require("cli-color");
const cors = require("cors");
const UserSchema = require("./Database/Schema/User.js");
app.use(express.urlencoded({ extended: false }));
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(function (err, req, res, next) {
  if (!err.status) console.error(err);
  makeError(res, err.status || 500);
});
app.set("trust proxy", true);

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// MONGOOSE //////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/pwmanager", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB')
}).catch((err) => {
    console.log('Unable to connect to MongoDB Database.\nError: ' + err)
})
mongoose.connection.on("err", err => {
  console.error(`Mongoose connection error: \n ${err.stack}`);
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// ROUTES ////////////////////////////////////////
app.get("/dashboard/:name", (req, res) => {
  const name = req.params.name;

  let userdata = UserSchema.findOne({ name: name });
  if(!userdata) res.render({ error: "User not found" });

  console.log(userdata.name)
  res.render("register", {
      req: req,
  });
});

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// API //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
app.post("/api/auth/register", async (req, res) => {
    let {name , password , email} = req.body
    if(!name || !password || !email) return res.status(400).send({ error: "Please fill all fields" });
    let user = await UserSchema.findOne({email: email})
    if(user) return res.send(400, "User already exists")
    let localuser = new UserSchema({
        name: name,
        password: password,
        email: email
    })
    await localuser.save()
    return res.json({localuser});
});
app.post("/api/auth/login", async (req, res) => {
    let {name , password} = req.body
    console.log(name, password)
    let localuser = await UserSchema.findOne({name: name})
    if(!localuser) return res.send(400, "User does not exist")
    if(localuser.password !== password) return res.send(400, "Invalid password")
    if(localuser.password === password) {
    console.log("User found")
    return res.json({ status: 200, localuser });
    } else {
    return res.send(400, "Invalid password")
    }
});
////////////////////////////////////////////////////////////////////////////////
//Create a new string under UserSchema name string password string and save it to the database
app.post("/api/create/", async (req, res) => {
    let {name , password} = req.body
    let user = await UserSchema.findOne({name: name})
    if(!user) return res.send(400, "User does not exist")
    if(user.password !== password) return res.send(400, "Invalid password")
    if(user.password === password) {
      



    }
});

/////////////////////////////// SESSION ////////////////////////////////////////
app.listen(7777, () => {
    console.log(
      "//////////////////////////////////////////////////////////////////////////////////////////////////"
    );
    console.log(clc.white("App running at:"));
    console.log(clc.blue("- Local Server: 7777 "));
    console.log(clc.blue("- Website Server: localhost:7777"));
    console.log(
      "//////////////////////////////////////////////////////////////////////////////////////////////////"
    );
  });