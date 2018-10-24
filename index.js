require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const AuthStrategy = require("passport-auth0");
const {
    DOMAIN,
    CLIENT_ID,
    CLIENT_SECRET,
    SESSION_SECRET,
    PORT
} = process.env;

app = express();

app.use(session({
    secret:SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge: 1000*60*60*24*365
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new AuthStrategy(
    {
        domain: DOMAIN,
        clientID:CLIENT_ID, //<----YOU HAVE TO UPPERCASE client_ID
        clientSecret:CLIENT_SECRET,
        callbackURL:"/login",    //<----YOU HAVE TO UPPERCASE callbackURL
        scope:"openid email profile"
    },
    (authToken,refreshToken,extraParams,profile,done)=>{
        done(null,profile);
    }
))

passport.serializeUser((user,done)=>{
    done(null,user)
})

passport.deserializeUser((user,done)=>{
    done(null,user);
})

app.get("/login",passport.authenticate("auth0", {
    successRedirect:"/success",
    failureRedirect:"/"
}))
app.get("/success",(req,res)=>{
    console.log(req.user);
    //after messing with db 
    res.redirect("/you_did_it")
})

app.get("/api/isAuthed",(req,res)=>{
    if(req.user){
        return res.status(200).json(req.user)
    }
    else{
        return res.status(500).json("No User Found");
    }
})
app.get("/api/logout",(req,res)=>{
  req.session.destroy();
})

let port = PORT || 3000
app.listen(port,()=>{
    console.log("Listening on port: "+port)
})