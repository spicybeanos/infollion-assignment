const pgp = require('pg-promise')(/* options */)
const db = pgp('postgres://username:password@host:port/database')



export async function selectToken(token){
    await db.any('SELECT * FROM sesh_tokens WHERE token = $1',[token])
}