var express = require('express');
var {getPassHash} = require("../database")

var router = express.Router();
// import { getPassHash } from '../database.js'

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const password = req.body.pass;
    const hash = await getPassHash(username);

    if (hash == null) {
      res.send("Invalid username").status(404);
    }

    const result = bcrypt.compare(password, hash)
    if (result) {
      res.send("loddeg in successfully").status(200)
    } else {
      res.send("Invalid username/password").status(400);
    }
  }
  catch (ex) {
    console.log(`Failed to log in: ${ex}`)
    res.send("failed to log in").status(500);
  }
});

module.exports = router;
