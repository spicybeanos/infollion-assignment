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

async function getSessionFromToken(sessionToken) {
  const query = `
    SELECT * FROM token
    WHERE session_token = $1;
  `;

  try {
    const token = await db.oneOrNone(query, [sessionToken]);
    return token; // null if not found
  } catch (error) {
    throw error;
  }
}

async function getUserFromSession(token) {
  const query = `
        SELECT username FROM token
        WHERE session_token = $1;
    `;
  const result = await db.oneOrNone(query, [token]);
  return result.username;
}
async function getUser(username) {
  const query = `
        SELECT * FROM users
        WHERE username = $1;
    `;
  const result = await db.oneOrNone(query, [token]);
  return result;
}
async function addAccount(username, balance) {
  const query = `
    INSERT INTO account (username, balance)
    VALUES ($1, $2)
    RETURNING *;
  `;

  try {
    const account = await db.one(query, [username, balance]);
    return account;
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Account already exists for this username.');
    }
    throw error;
  }
}

async function getBalanceByUsername(username) {
  const query = `
    SELECT balance FROM account
    WHERE username = $1;
  `;

  try {
    const result = await db.oneOrNone(query, [username]);
    return result ? result.balance : null;
  } catch (error) {
    throw error;
  }
}

async function transferBalance(fromUsername, toUsername, amt) {
  if (amt <= 0) {
    throw new Error('Transfer amount must be greater than zero.');
  }

  if (fromUsername == toUsername) {
    throw new Error('Cannot transfer money to oneself.');
  }

  return db.tx(async t => {
    const sender = await t.oneOrNone(
      'SELECT balance FROM account WHERE username = $1 FOR UPDATE',
      [fromUsername]
    );

    const receiver = await t.oneOrNone(
      'SELECT balance FROM account WHERE username = $1 FOR UPDATE',
      [toUsername]
    );

    if (!sender) throw new Error('Sender account not found.');
    if (!receiver) throw new Error('Receiver account not found.');
    if (sender.balance < amt) throw new Error('Insufficient balance.');

    await t.none(
      'UPDATE account SET balance = balance - $1 WHERE username = $2',
      [amt, fromUsername]
    );

    await t.none(
      'UPDATE account SET balance = balance + $1 WHERE username = $2',
      [amt, toUsername]
    );

    await logTransaction(fromUsername, toUsername, amt);

    return true;
  });
}

async function fraudCheck(username, amount) {
  const flags = [];
  const { count: rapidCount } = await db.one(
    `SELECT COUNT(*) FROM transactions
     WHERE from_user = $1 AND time > NOW() - INTERVAL '1 minute'`,
    [username]
  );
  if (parseInt(rapidCount) >= 5) {
    flags.push('Multiple transfers in under 1 minute');
  }
  const { balance: bal } = await db.one(
    `SELECT balance FROM account WHERE username = $1`,
    [username]
  );
  const percentage = (amount / bal) * 100;

  if (percentage > 50) {
    flags.push(`Large withdrawal: ${percentage.toFixed(1)}% of balance`);
  }

  return flags;
}

async function logFraud(fromUser, fraudList) {
  const query = `
    INSERT INTO fraud_flags (username, reason)
    VALUES ($1, $2)
    RETURNING *;
  `;

  let fraud = ''; let idx = 1;
  fraudList.forEach(fr => {
    fraud += `${idx})${fr}\n`;
    idx++;
  });

  try {
    await db.one(query, [fromUser, fraud]);
    return;
  }
  catch (ex) {
    throw ex;
  }
}

async function logTransaction(fromUser, toUser, amount) {
  const query = `
    INSERT INTO transactions (from_user, to_user, amount)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  try {
    const transaction = await db.one(query, [fromUser, toUser, amount]);
    return transaction;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getPassHash,
  addCred,
  addUser,
  upsertToken,
  deleteTokenBySession,
  getUserFromSession,
  getSessionFromToken,
  addAccount,
  getBalanceByUsername,
  transferBalance,
  getUser,
  fraudCheck,
  logFraud
}