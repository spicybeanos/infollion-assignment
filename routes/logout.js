var express = require('express');
var {getPassHash,upsertToken} = require("../database")

var router = express.Router();
// import { getPassHash } from '../database.js'

const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

router.post('/', async function (req, res, next) {
  try {

  }
  catch (ex) {
    console.log(`Failed to log out: ${ex}`)
    res.status(500);
    res.send("failed to log out");
    return
  }
});

module.exports = router;
