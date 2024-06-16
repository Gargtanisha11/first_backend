# backend project 
  This is my first backend project which I learn from [chai aur code](https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)  youTube channel 

 ---
### step 1:- set mongo atlas 
- create project 
- connect database
- network access 
- database access

### step 2:- install 
 - nodemon(automatically restart server after changes),
 - moongoose(database connection ), 
 - express(manage server and routes), 
 - dotenv(handle env variable) , 
 - jwt( for generate access token and refresh token  ), 
 - bcrypt( for hashing the password and compare orignal password ), 
 - cookie parser(handle cookie),
 - multer(file handling from response),

### step 3:- set env file ( PORT AND DATABASE CONNECT STRING - not / in string ) and connect with database 
 
#### NOTE
  - two approach for connect db
   1. direct from index file 
   2. or write the function in  file of folder db and import in index file to execute 

#### Note
   Always wrap your code in try and catch or promise    
   Always use async and await because our code is present in other continent


### step 4 : cloudinary for storing  the files

### step 5 : user model , video model ,subscription model etc

### step 6 :controller for user ,video etc 

### step 7 :create the router for all endpoint in routes folder 

### step 8 : add the route in app.js file
 
# Postman ( debugging the controller)
- create environment variable for add (localhost:8000/api/v1 ) in request 
- create collection name as youtubebackend -> users(folder) -> register( post request) ( its benefits is that it enable us to group our all request together, share it , oranganize our request ,use in Api request )


