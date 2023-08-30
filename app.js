// environment DB_URL = mongodb+srv://codewizard26:nikhil@cluster0.gssisbo.mongodb.net/?retryWrites=true&w=majority

const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("./db/userModel")
const auth = require("./auth")

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (request, response, next) => {
  response.json({ message: "Hey! This is your server response!" });
  next();
});


// require database connection

const dbConnect = require("./db/dbConnect");
dbConnect()

// cors  error handling

app.use((req,res,next) =>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content,Accept,Content-Type,Authorization"
  )

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    )

  next()
})


app.post("/register",(request,response) =>{
  bcrypt.hash(request.body.password,10)
  .then((hashedPassword) =>{
    const user = new User ({
      name: request.body.name,
      email: request.body.email,
      password: hashedPassword
    })

    user.save()
    .then((result) =>{
      response.status(201).send({
        message:"User Created Successfully",
        result,
      })
    })

    .catch((error) =>{
      response.status(500).send({
        message:"Error creating user",
        error
      })
    })
  })
  .catch((e) =>{
    response.status(500).send({
      message:"Password was not hashed successfully",
      e,
    })
  })
})


app.post("/login" ,(request, response) =>{
  User.findOne({email: request.body.email})
  .then((user) =>{
    bcrypt.compare(request.body.password,user.password)
    .then((passwordCheck) =>{
      if (!passwordCheck){
        return response.status(400).send({
          message:"Password does not match",
          error,
        })
      }

      //create jwt token

      const token = jwt.sign({
        userId: user._id,
        userName: user.name,
        userEmail: user.email
      },
      "RANDOM-TOKEN",
      {expiresIn:"24h"}
      )

      response.status(200).send({
        message:"Login Successful",
        name: user.name,
        email: user.email,
        token
      })
    })

    // catch if the password does not match

    .catch((error) =>{
      response.status(400).send({
        message:"Password does not match",
        error,
      })
    })
  })
  .catch((e) =>{
    response.status(400).send({
      message:"email not found",
      e
    })
  })
})

app.get("/free-endpoint", (request, response) => {
  response.json({ message: "You are free to access me anytime" });
});

app.get("/auth-endpoint", (request, response) => {
  response.json({ message: "You are authorized to access me" });
});


module.exports = app;
