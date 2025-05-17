const { getSessionFromToken } = require("./database");

async function validateToken(token) {
    const session = await getSessionFromToken(token);
    if (!session) {
        return false;
    }
    const now = new Date().getTime()
    const expiry = new Date(session.expiry).getTime();
    return now > expiry;
}

module.exports = {
    validateToken
}