var express = require('express');
var router = express.Router();
var { getUserFromSession,getBalanceByUsername,transferBalance,logFraud,fraudCheck } = require("../database");

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
