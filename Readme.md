# backend series

# mongoDb
step 1:- set mongo atlas 
- create project 
- connect database
- network access 
- database access

step 2:- install moongoose express dotenv 

step 3:- set env file ( PORT AND DATABASE CONNECT STRING - not / in string )
 
# NOTE
  - two approach for connect db
   1. direct from index file 
   2. or write the function in  file of folder db and import in index file to execute 

# Note
   Always wrap your code in try and catch or promise    
   Always use async and await because our code is present in other continent


step 4 : cloudinary

step 5 : user model and video model

step 6 :controller for user - user register logic
                            - user login logic 
                            - user logout logic (before logout logic we need to create an middleware )

step 7 : 


# related to mongodbatlas 
  if your password have special character in it then you have to change it using percent encoding 





# Error
- In postman i get an error for uploading two fields for file at a time -get resolve but don't able to know what the problem
- when user already existed the files is not deleted from public - resolve by writing unLinkSync file in if condition of existed user 


# Postman
- create environment variable for add (localhost:8000/api/v1 ) in request 
- create collection name as youtubebackend -> users(folder) -> register( post request) ( its benefits is that it enable us to group our all request together, share it , oranganize our request ,use in Api request )


