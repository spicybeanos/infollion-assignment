var express = require('express');
var router = express.Router();
var { addCred, addUser, addAccount } = require("../database")

const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account, credentials, and associated balance account with an optional currency.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - pass
 *               - email
 *               - phone
 *               - name
 *             properties:
 *               user:
 *                 type: string
 *                 description: Desired username
 *                 example: johndoe
 *               pass:
 *                 type: string
 *                 description: Password (will be hashed)
 *                 example: strongPassword123
 *               email:
 *                 type: string
 *                 description: Email address
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+911234567890"
 *               name:
 *                 type: string
 *                 description: Full name
 *                 example: John Doe
 *               currency:
 *                 type: string
 *                 description: Optional currency code (default is INR)
 *                 example: USD
 *     responses:
 *       200:
 *         description: Successfully registered user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Signed up user johndoe
 *       400:
 *         description: Required fields are missing
 *       500:
 *         description: Internal server error
 */

router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const pass = req.body.pass;
    const email = req.body.email;
    const phone = req.body.phone;
    const name = req.body.name;
    const currency = req.body.currency == null ? "INR" : req.body.currency;

    if (username == null || pass == null || email == null || phone == null || name == null) {
      res.status(400).send("Fields are empty!");
      return;
    }

    const phash = await bcrypt.hash(pass, saltRounds);
    await addUser(name, email, username, phone);
    await addCred(username, phash);
    await addAccount(username, 0, currency)

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
