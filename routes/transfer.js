var express = require('express');
var router = express.Router();
var { getUserFromSession,getBalanceByUsername,transferBalance,logFraud,fraudCheck } = require("../database");

/**
 * @swagger
 * /transfer/{to}:
 *   post:
 *     summary: Transfer funds from authenticated user to another user
 *     description: |
 *       Transfers the specified amount from the logged-in user's account to the user identified by the `to` path parameter.
 *       Performs fraud checks and blocks suspicious transfers.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the recipient of the transfer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount to transfer
 *                 example: 100.50
 *     responses:
 *       200:
 *         description: Transfer complete successfully
 *       400:
 *         description: Bad request (e.g. missing amount, insufficient balance, or sender user does not exist)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Insufficient balance"
 *       403:
 *         description: Transfer blocked due to suspected fraud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Possible fraud detected!"
 *                 reason:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Multiple transfers in short period", "Sudden large withdrawal"]
 *       500:
 *         description: Server error during transfer
 */

router.post('/:to', async function (req, res, next) {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const from = await getUserFromSession(token);

        const amount = req.body.amount;

        const to = req.params.to;
        const bal = await getBalanceByUsername(from);
        if(!bal){
            res.status(400).send("Sender user doesnt exist!");
            return;
        }
        if(!amount){
            res.status(400).send("No amount mentioned in body!");
            return;
        }
        if(bal < amount){
            res.status(400).send("Insuffcient balance");
            return;
        }

        const flags = await fraudCheck(from,amount);

        if(flags.length > 0){
            await logFraud(from,flags);
            return res.status(403).send(
                JSON.stringify(
                    {
                        error:"Possible fraud detected!",
                        reason:flags
                    }
                )
            );
        }

        await transferBalance(from,to,amount);
        res.status(200).send("Transfer complete")
        return;
    }
    catch (ex) {
        console.log(`Failed to transfer: ${ex}`)
        res.status(500).send(`Failed to transfer to ${req.params.to}`)
        return
    }
});

module.exports = router;
