const express = require('express');
const app = express();
const mongoose = require('mongoose');
const clc = require("cli-color");
const cors = require("cors");
const UserSchema = require("./Database/Schema/User.js");
const PasswordsSchema = require("./Database/Schema/passwords.js");
const { createClient } = require('redis');

const client = createClient({
  url: "redis://Fighting35a@64.44.152.39:6878",
});

(async () => {
    await client.connect();
})();

client.on('connect', () => console.log('::> Redis Client Connected'));
client.on('error', (err) => console.log('<:: Redis Client Error', err));

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
    console.log(clc.green("Event [Auth]: " + name))
    return res.json({localuser});
});

app.post("/api/auth/login", async (req, res) => {
    let {name , password} = req.body
    let localuser = await UserSchema.findOne({name: name})
    if(localuser) {
    if(localuser.password !== password) return res.send(400, "Invalid password")
    if(localuser.password === password) {
    console.log(clc.green("Event [Auth]: " + localuser.name))
    return res.json({localuser});
    }
    } else {
    console.log("Invalid password")
    return res.send(400, "Invalid password")
    }
});

////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Get passwords ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
app.post("/api/passdata", async (req, res) => {
  let {name , email} = req.body
  let user = await UserSchema.findOne({email: email})
  if(user) {
    if(user.email === email) {
      console.log(clc.yellow("Event [Data REQ]: " + user.name))
      let data = await PasswordsSchema.find({email: email})
      let mappeddata = data.map(item => {
        return {
          name: item.name,
          password: item.password,
        }
      })
      console.log(mappeddata)
      return res.send(200, mappeddata);


    }
  } else {
    return res.send(400, "Invalid Data provided!")
  }

});
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////Create password//////////////////////////////////
app.post("/api/create", async (req, res) => {
    let {email, setname, setpassword} = req.body
    console.log(email, setname, setpassword)
    let user = await UserSchema.findOne({email: email})
    if(!user) return res.send(400, "User does not exist")
    if(user.email !== email) return res.send(400, "Invalid password")
    if(user.email === email) {
      console.log(clc.yellow("Event [Data CREATE]: " + user.name))

      let newdata = new PasswordsSchema({
        email: email,
        name: setname,
        password: setpassword
      })
      await newdata.save()
      return res.send(200, "Approved")
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