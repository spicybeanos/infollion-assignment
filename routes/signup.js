var express = require('express');
var router = express.Router();
var { addCred,addUser,addAccount } = require("../database")

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const pass = req.body.pass;
    const email = req.body.email;
    const phone = req.body.phone;
    const name = req.body.name;

    if(username == null || pass == null || email == null || phone == null || name == null){
      res.status(400).send("Fields are empty!");
      return;
    }

    const phash = await bcrypt.hash(pass, saltRounds);
    await addUser(name,email,username,phone);
    await addCred(username, phash);
    await addAccount(username,0)

    res.send(`Signed up user ${username}`);
    return;
  }
  catch (ex) {
    console.log(`Cannot sign up: ${ex}`);
    res.status(500).send('failed to sign up')
    return
  }
});

module.exports = router;
