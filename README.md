## Route documentation

#### Signing up `/signup`
- POST
  - Body: `{ user:string, pass:string, email:string, phone:string, name:string }`
  - Auth : none
  - This route will create a user in the database with the information mentioned in the body and will create an account with 0 money.
  - Passwords are hashed and salted

#### Logging in `/login`
- POST
  - body : `{ user:string, pass:string }`
  - Checks for user in database and validates password
  - Returns : Session token `{ token:string }` which is to be used when checking balances and transfering money.
  - Session tokens expire in 3 hours.

- DELETE
  - Auth : `Bearer Token`
  - Deletes the session token from the database