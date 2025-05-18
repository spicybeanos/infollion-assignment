var express = require('express');
var router = express.Router();
var { getFlaggedTransactions,
    getAllUserBalances,
    getTop10UsersByBalance,
    getTop10UsersByTransactionVolume } = require("../database")

/**
 * @swagger
 * /admin:
 * 
 *   get:
 *     summary: Admin root endpoint
 *     description: Provides info about available admin subroutes.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Info message about admin endpoints
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "/flagged for flagged transactions\n/agrigate for agrigated user balances\n/top/bal for top 10 users by balance and\n /top/transactions for top 10 users by transaction volume."
 *       500:
 *         description: Server error
 */
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

/** 
 * @swagger
 * /admin/flagged:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get all flagged transactions
 *     description: Retrieve transactions that have been flagged for fraud.
 *     responses:
 *       200:
 *         description: List of flagged transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   reason:
 *                     type: string
 *                   time:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Could not get flagged transactions
 */
router.get('/flagged', async function (req, res, next) {
    try {
        const flagged = await getFlaggedTransactions();
        return res.send(JSON.stringify(flagged));
    } catch (ex) {
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get flagged transactions!")
    }
});

/**
*  @swagger 
* /admin/agrigate:
*   get:
*     security:
*       - bearerAuth: []
*     summary: Get all user balances aggregated
*     description: Retrieve aggregated balances of all users.
*     responses:
*       200:
*         description: Aggregated user balances
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   username:
*                     type: string
*                   balance:
*                     type: number
*                     format: float
*       500:
*         description: Could not get aggregated user balances
*/
router.get('/agrigate', async function (req, res, next) {
    try {
        const flagged = await getAllUserBalances();
        return res.send(JSON.stringify(flagged));
    } catch (ex) {
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get aggregating total user balances!")
    }
});

/**
 *  @swagger
 * /admin/top/bal:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get top 10 users by balance
 *     description: Retrieve the top 10 users with the highest account balances.
 *     responses:
 *       200:
 *         description: Top 10 users by balance
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   balance:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Could not get top 10 user balances
 */
router.get('/top/bal', async function (req, res, next) {
    try {
        const flagged = await getTop10UsersByBalance();
        return res.send(JSON.stringify(flagged));
    } catch (ex) {
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get top 10 user balances!")
    }
});

/** 
 * @swagger
 * /admin/top/transactions:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Get top 10 users by transaction volume
 *     description: Retrieve the top 10 users by total transaction volume.
 *     responses:
 *       200:
 *         description: Top 10 users by transaction volume
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   total_sent:
 *                     type: number
 *                     format: float
 *                   total_transactions:
 *                     type: integer
 *       500:
 *         description: Could not get top 10 transaction volumes
 */
router.get('/top/transactions', async function (req, res, next) {
    try {
        const flagged = await getTop10UsersByTransactionVolume();
        return res.send(JSON.stringify(flagged));
    } catch (ex) {
        console.log(`Failed admin operation : ${ex}`);
        return res.status(500).send("Could not get top 10 transaction volumes!")
    }
});



module.exports = router;
