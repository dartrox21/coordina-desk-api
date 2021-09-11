# generic-node-api
EDP API using nodejs

execute `npm install`

To run the server in development: `npm run dev`
To run the server in prod: `npm run start` 

#### Configuration
A .env file must be created in the path = src/configuration/.env
It must contain the following properties:
PORT=3000
SECRET=secret_for_hash
EXP_DATE=1min
SALT_ROUNDS=10
DB_USER=username
DB_PASSWORD=password
BD_URI=database_example.com/market


##### Authentication
All the routes with the exception of '/auth/login' require valid auth credentials that can be get by accessing the following route
GET {{URL}}/auth/login
The valid token is returned in the headers
KEY = Authorization


###### POSTMAN TIP
In your LOGIN request in the section of `Tests` you can add the following code to get the token and set it as a global variable so you can access it easier in other requests
`
const token = pm.response.headers.get("Authorization");
if(token !== undefined && token !== null ) {
    pm.globals.set("TOKEN", token);
}
`



