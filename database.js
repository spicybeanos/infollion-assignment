const pgp = require('pg-promise')(/* options */)

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const db = pgp(`postgres://${dbUser}:${dbPass}@localhost:5432`)

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

async function addUser(name, email, username, phone) {
    try {
        const query = `
      INSERT INTO users (name, email, username, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const user = await db.one(query, [name, email, username, phone]);
        return user;
    } catch (error) {
        if (error.code === '23505') {
            throw new Error('Username already exists.');
        }
        throw error;
    }
}

async function getPassHash(username) {
    try {
        const result = await db.oneOrNone(
            'SELECT passhash FROM creds WHERE username = $1',
            [username]
        );

        if (!result) {
            // console.log('User not found');
            return null;
        }

        return result.passhash;
    } catch (err) {
        console.error('Error fetching passhash:', err);
        throw err;
    }
}

async function upsertToken(username, sessionToken, expiry) {
    const query = `
    INSERT INTO token (username, session_token, expiry)
    VALUES ($1, $2, $3)
    ON CONFLICT (username)
    DO UPDATE SET session_token = EXCLUDED.session_token, expiry = EXCLUDED.expiry
    RETURNING *;
  `;

    try {
        const token = await db.one(query, [username, sessionToken, expiry]);
        return token;
    } catch (error) {
        throw error;
    }
}

async function deleteTokenBySession(sessionToken) {
    const query = `
    DELETE FROM token
    WHERE session_token = $1
    RETURNING *;
  `;

    try {
        const result = await db.oneOrNone(query, [sessionToken]);
        return !!result; // true if deleted, false if no match found
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getPassHash,
    addCred,
    addUser,
    upsertToken,
    deleteTokenBySession
}