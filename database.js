const pgp = require('pg-promise')(/* options */)

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const db = pgp(`postgres://${dbUser}:${dbPass}@host:5432/database`)

async function selectToken(token) {
    await db.any('SELECT * FROM token WHERE session_token = $1', [token])
}
async function addCred(username, passhash) {
    try {
        await db.none(
            'INSERT INTO creds (username, passhash) VALUES ($1, $2)',
            [username, passhash]
        );
        console.log('Credentials added successfully');
    } catch (err) {
        console.error('Error inserting credentials:', err);
        throw err;
    }
}
async function getPassHash(username) {
    try {
        const result = await db.oneOrNone(
            'SELECT passhash FROM creds WHERE username = $1',
            [username]
        );

        if (!result) {
            console.log('User not found');
            return null;
        }

        return result.passhash;
    } catch (err) {
        console.error('Error fetching passhash:', err);
        throw err;
    }
}

module.exports = {
    getPassHash,addCred
}