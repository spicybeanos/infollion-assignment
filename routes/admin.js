var express = require('express');
var router = express.Router();
var { getFlaggedTransactions,
    getAllUserBalances,
    getTop10UsersByBalance,
    getTop10UsersByTransactionVolume } = require("../database")


router.get('/', async function (req, res, next) {
    try {
        return res.status(200).send("/flagged for flagged transactions\n/agrigate for agrigated user balances\n/top/bal for top 10 users by balance and\n /top/transactions for top 10 users by transaction volume.");
    }
    catch (ex) {
        console.log(`Failed admin operation : ${ex}`);
        res.status(500).send('failed to get balance')
        return
    }
});

router.get('/flagged', async function (req, res, next) {
    try {
        const flagged = await getFlaggedTransactions();
        return res.send(JSON.stringify(flagged));
    }catch(ex){
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get flagged transactions!")
    }
});

router.get('/agrigate', async function (req, res, next) {
    try {
        const flagged = await getAllUserBalances();
        return res.send(JSON.stringify(flagged));
    }catch(ex){
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get aggregating total user balances!")
    }
});

router.get('/top/bal', async function (req, res, next) {
    try {
        const flagged = await getTop10UsersByBalance();
        return res.send(JSON.stringify(flagged));
    }catch(ex){
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get top 10 user balances!")
    }
});

router.get('/top/transactions', async function (req, res, next) {
    try {
        const flagged = await getTop10UsersByTransactionVolume();
        return res.send(JSON.stringify(flagged));
    }catch(ex){
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get top 10 transaction volumes!")
    }
});



module.exports = router;
