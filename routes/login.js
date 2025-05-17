var express = require('express');
var { deleteTokenBySession,getPassHash,upsertToken } = require("../database");

var router = express.Router();
// import { getPassHash } from '../database.js'


const bcrypt = require('bcrypt');
const saltRounds = 10;

router.delete('/', async function (req, res, next) {
  try {
    let auth = req.headers.authorization.split(' ');
    if(auth.length < 2){
      res.status(403).send("");
    }
    const token = auth[1];
    if(auth == null || auth == undefined){
      res.status(400).send("No token provided.");
      return;
    }
    await deleteTokenBySession(token);
    res.status(200).send("Logged out.")
    return;
  } 
  catch (ex) {
    console.log(`Failed to logout : ${ex}`)
    res.status(500).send("Failed to logout.");
    return;
  }
})

router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const password = req.body.pass;
    const hash = await getPassHash(username);

    if (hash == null) {
      res.status(404)
      send("Invalid username");
      return
    }

    const result = bcrypt.compare(password, hash)
    if (result) {
      const token = require('crypto').randomBytes(32).toString('hex');
      let expiry = new Date();
      // console.log(`now : ${expiry.toISOString()}`)
      expiry = new Date(expiry.getTime() + 1000 * 3600 * 3);
      // console.log(`expiry date time : ${expiry.toISOString()}`)
      await upsertToken(username, token, expiry.toISOString())

      res.status(200).send(JSON.stringify({ token: token }));
      return
    } else {
      res.status(400)
      send("Invalid username/password");
      return
    }
  }
  catch (ex) {
    console.log(`Failed to log in: ${ex}`)
    res.status(500);
    res.send("failed to log in");
    return
  }
});

module.exports = router;
