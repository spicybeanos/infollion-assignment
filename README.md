## Set-up
#### Database tables
- List of relations
| Schema |     Name     | Type  |  Owner   |
|--------|--------------|-------|----------|
| public | account      | table | postgres |
| public | creds        | table | postgres |
| public | fraud_flags  | table | postgres |
| public | token        | table | postgres |
| public | transactions | table | postgres |
| public | users        | table | postgres |

- Table "public.account"
  Column  |       Type        | Collation | Nullable | Default
----------+-------------------+-----------+----------+---------
 username | character varying |           | not null |
 balance  | numeric           |           |          | 0

- Table "public.creds"
  Column  |       Type        | Collation | Nullable | Default
----------+-------------------+-----------+----------+---------
 username | character varying |           | not null |
 passhash | text              |           | not null |

- Table "public.fraud_flags"
  Column  |            Type             | Collation | Nullable |                 Default
----------+-----------------------------+-----------+----------+-----------------------------------------
 id       | integer                     |           | not null | nextval('fraud_flags_id_seq'::regclass)
 username | character varying           |           |          |
 reason   | text                        |           | not null |
 time     | timestamp without time zone |           |          | CURRENT_TIMESTAMP

- Table "public.token"
    Column     |            Type             | Collation | Nullable | Default
---------------+-----------------------------+-----------+----------+---------
 session_token | text                        |           | not null |
 username      | character varying           |           |          |
 expiry        | timestamp without time zone |           | not null |

-  Table "public.transactions"
  Column   |            Type             | Collation | Nullable |                 Default
-----------+-----------------------------+-----------+----------+------------------------------------------
 id        | integer                     |           | not null | nextval('transactions_id_seq'::regclass)
 time      | timestamp without time zone |           |          | CURRENT_TIMESTAMP
 from_user | character varying           |           |          |
 to_user   | character varying           |           |          |
 amount    | numeric                     |           | not null |

- Table "public.users"
  Column  |       Type        | Collation | Nullable | Default
----------+-------------------+-----------+----------+---------
 name     | character varying |           | not null |
 email    | character varying |           | not null |
 username | character varying |           | not null |
 phone    | character varying |           |          |

#### .env file
The .env file must havet the following:
DB_USER=`postgres db user`
DB_PASS=`postgres db password`
ADMIN=`admin username`

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