var express = require('express');
var router = express.Router();
var { getUserFromSession,getBalanceByUsername } = require("../database")

const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', async function (req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const username = await getUserFromSession(token);
        console.log(`username: ${username}`)
        const balance = parseFloat(await getBalanceByUsername(username));
        res.status(200).send(JSON.stringify({balance:balance}))
        return;
    }
    catch (ex) {
        res.status(500).send('failed to get balance')
        return
    }
});

module.exports = router;
