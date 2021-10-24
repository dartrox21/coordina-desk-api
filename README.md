# COORDINA-DESK-api
COORDINA-DESK API using nodejs

execute `npm install`

To run the server in development: `npm run dev`
To run the server in prod: `npm run start`

#### Configuration
A .env file must be created in the path = src/configuration/.env when using it in local if not the followind env properties must be set in your server
It must contain the following properties:
`PORT=3000`   <- Only in your local env file
`SECRET=secret_for_hash`
`EXP_DATE=1min`   <- Expiration time for the tokens ex: 1min - 8hr for more options consult: https://www.npmjs.com/package/jsonwebtoken
`SALT_ROUNDS=10`
`DB_USER=db_username`  <- Your mongodb username
`DB_PASSWORD=db_password` <- Your mongodb password
`BD_URI=database_example.com/market`   <- Your mongodb URI
`NODE_ENV=production | delevopment`
`TZ=timezone that will be used by the server and cron jobs`

##### Environments
If you setup `NODE_ENV=production` a more elaborated cors implementation will be setup. (cors implementation -> configuration/cors.js)


##### Authentication
Some routes require a valid token that can be get by accessing the following route
GET {{URL}}/auth/login
The valid token is returned as `Authorization`


###### POSTMAN TIP
In your LOGIN request in the section of `Tests` you can add the following code to get the token and set it as a global variable so you can access it easier in other requests
`
const token = pm.response.headers.get("Authorization");
if(token !== undefined && token !== null ) {
    pm.globals.set("TOKEN", token);
}
`





