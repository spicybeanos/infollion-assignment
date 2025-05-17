## Route documentation

#### Signing up `/signup`
- POST
  - Body: `{ user:string, pass:string, email:string, phone:string, name:string, currency?:"INR"|"USD" }`
  - Auth : none
  - This route will create a user in the database with the information mentioned in the body and will create an account with 0 money.
  - Passwords are hashed and salted

#### Logging in `/login`
- POST
  - Body : `{ user:string, pass:string }`
  - Checks for user in database and validates password
  - Returns : Session token `{ token:string }` which is to be used when checking balances and transfering money.
  - Session tokens expire in 3 hours.
  - Exceptions:
    - 

- DELETE
  - Auth : `Bearer Token`
  - Deletes the session token from the database

#### Checking balance `/balance`
- GET
  - Auth : `Bearer token`
  - Returns : The amount of money in the account of the user `{ balance:number }`

#### Transfering amount `/transfer/[to_user]`
- POST
  - Auth : `Bearer token`
  - Body : The amount of money `{ amount:number }` that is to be transfered
  - Exceptions : 
    - Insuffcient balance : if balance < amt
    - Fraud
      - Multiple transfers in under 1 minute
      - Large withdrawal ( amt > 50% of balance)