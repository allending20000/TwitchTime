# TwitchTime
## Table of Contents
1. [Overview](#overview)
2. [Contributors](#contributors)
3. [Motivation](#motivation)
4. [Technologies](#technologies)
5. [Running Application](#running-application)
6. [Issues](#issues)
7. [Possible Improvements](#possible-improvements)

## Overview
TwitchTime is a web application designed to help users manage their time watching their favorite Twitch channels. 
The application requires users to login with their own Twitch account using OAuth authorization code flow and fetches information from
Twitch using the Twitch API. The app embeds both the video player and Twitch Chat. It can be accessed at https://twitchtime-app.herokuapp.com/.

## Contributors
Allen Ding (https://github.com/allending20000)

## Motivation
It can be difficult to manage time spent on Twitch because unlike other sources of entertainment like Youtube or MOBAs, there is no set time limit.

## Technologies
* Javascript
* HTML5
* CSS3
* React.js
* Express.js
* Node.js
* MongoDB Atlas
* Mongoose
* Redux Toolkit
* React Router
* Heroku

## Running Application

### Development Environment

1. Clone the repository.
```
git clone https://github.com/allending20000/twitch-proj.git
```
2. Add .env file at root level.
3. Register new application in Twitch developer console (https://dev.twitch.tv/console/apps).
    1. Add http://localhost:3000/callback under OAuth Redirect URLs.
    2. Generate a Client Secret.
    3. Copy Client ID and Client Secret into .env file.
4. Create a new database on MongoDB Atlas and copy the connection string into the .env file.
```
TWITCH_CLIENT_ID=''
TWITCH_SECRET=''
TWITCH_REDIRECT_CODE=http://localhost:3000/callback
TWITCH_SCOPES=user:read:follows user:read:email
MONGODB_CONNECTION_STRING=''
```
5. Add "http://localhost:8000" in front of server API calls in Authentication.js, Callback.js, Dashboard.js, Entry.js, and Timer.js in client folder.
6. Run the following commands in Terminal.
```
cd twitch-proj
(Install packages for server)
npm install
cd client
(Install packages for client)
npm install
cd ..
(Start the server)
npm start
(On Separate Terminal)
cd client
(Start the client)
npm start
```
7. The application should be accessed on http://localhost:3000.

### Production Environment
* The application should be accessed on https://twitchtime-app.herokuapp.com/.

## Issues
* The application was originally planned to include a feature for following a Twitch channel, which would add them to the dashboard. 
However, the Twitch API has this feature disabled according to https://discuss.dev.twitch.tv/t/deprecation-of-create-and-delete-follows-api-endpoints/32351.

## Possible Improvements
* Adding a Logout button
* Add channel to dashboard without using Twitch API
* Add exact time watched whenever user goes back to dashboard using browser back button before timer reaches 0
