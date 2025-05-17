var express = require('express');
var router = express.Router();
var { getUserFromSession,getBalanceByUsername } = require("../database")

const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @swagger
 * /balance:
 *   get:
 *     summary: Get the balance of the authenticated user
 *     description: Returns the balance for the user associated with the provided session token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   format: float
 *                   example: 1000.00
 *       403:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error while retrieving balance
 */

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
