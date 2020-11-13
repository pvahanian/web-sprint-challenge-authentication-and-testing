const express = require('express')
const router = express.Router()
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Helper = require('./helperModel')
const {jwtSecret} = require('./secrets.js')

router.post('/register', (req, res) => {

const credentials = req.body //used to get data from the post request

if(isValid(credentials)){
            const hash = bcrypt.hashSync(credentials.password, 8) // sets how many times the pass is hashed
            credentials.password = hash;
            Helper.add(credentials)
            .then(user => {
                res.status(201).json({data:user})
            })
        }
        else {
            res.status(400).json({
                message: "please provide username and password and the password should be alphanumeric",
            });
        }
    })

router.post('/login', (req, res)=>{
    const {username, password} = req.body

    if(isValid(req.body)){
        Helper.findBy({username:username})
        .then(([user]) => {
            if (user && bcryptjs.compareSync(password, user.password)){
                const token = makeToken(user) // makes the token
                res.status(200).json({message: "Welcome Friendo", token})
            } 
            else
            {
                res.status(401).json({message: "Invalid creds!"})
            }
        })
        .catch(error => {
            res.status(500).json({ message: error.message });
          });
    }
    else
    {
        res.status(400).json({
            message:"Please provide valid shit!"
        })
    }
})

//MiddleWare

function secure(req, res, next) {
    // check if there is a user in the session
    if (req.session && req.session.user) {
        next()
    } else {
        res.status(401).json({ message: 'Unauthorized!' })
    }
}

function makeToken(user) {
    const payload = {
      subject: user.id,
      username: user.username,
      role: user.role,
      foo: 'bar',
    };
    const options = {
      expiresIn: '25 seconds',
    };
    return jwt.sign(payload, jwtSecret, options);
  }

  function isValid(user) {
    return Boolean(user.username && user.password && typeof user.password === "string");
  }

  
function restricted (req,res,next) {
  const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ message: 'we wants token' });
    }
  
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        console.log('decoded error ->', err);
        return res.status(401).json({ message: 'token bad' });
      }
  
      console.log('decoded token ->', decoded);
      req.decodedJwt = decoded;
      next();
    });
  };
  

module.exports =router