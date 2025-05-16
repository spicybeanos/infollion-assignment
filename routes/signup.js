var express = require('express');
var router = express.Router();
var { addCred,addUser } = require("../database")

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const pass = req.body.pass;
    const email = req.body.email;
    const phone = req.body.phone;
    const name = req.body.name;

    const phash = await bcrypt.hash(pass, saltRounds);
    await addUser(name,email,username,phone);
    await addCred(username, phash);

    res.send(`Signed up user ${username}`);
    return;
  }
  catch (ex) {
    res.status(500).send('failed to sign up')
    return
  }
});

module.exports = router;
