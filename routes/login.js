var express = require('express');
var { deleteTokenBySession, getPassHash, upsertToken } = require("../database");

var router = express.Router();
// import { getPassHash } from '../database.js'


const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @swagger
 * /login:
 *   delete:
 *     summary: Log out user
 *     description: Logs out a user by deleting the session token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: No token provided
 *       403:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */
router.delete('/', async function (req, res, next) {
  try {
    let auth = req.headers.authorization.split(' ');
    if (auth.length < 2) {
      res.status(403).send("");
    }
    const token = auth[1];
    if (auth == null || auth == undefined) {
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

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user with username and password. Returns a session token on success.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - pass
 *             properties:
 *               user:
 *                 type: string
 *                 description: The user's username
 *                 example: johndoe
 *               pass:
 *                 type: string
 *                 description: The user's password
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The session token
 *       400:
 *         description: Invalid username or password
 *       404:
 *         description: Username not found
 *       500:
 *         description: Server error
 */
router.post('/', async function (req, res, next) {
  try {
    const username = req.body.user;
    const password = req.body.pass;
    const hash = await getPassHash(username);

    if (hash == null) {
      res.status(404).
      send("Invalid username");
      return
    }

    const result = bcrypt.compare(password, hash)
    if (result) {
      const token = require('crypto').randomBytes(32).toString('hex');
      // console.log(`now : ${expiry.toISOString()}`)
      let expiry = new Date(new Date().getTime() + (3 * 3600 * 1000));
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
