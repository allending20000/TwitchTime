require('dotenv').config();
const express = require('express');
const crypto = require("crypto");
const AuthInfo = require("../models/authInfo");
const axios = require('axios');
var router = express.Router();

//Refreshes access token using the refresh token, returns modified document
const refreshAccessToken = async (userId) => {
    //Find the AuthInfo entry from database
    const [authDoc] = await AuthInfo.find({ userId: userId });
    //Parameters for POST request to get new tokens
    const params = {
        grant_type: "refresh_token",
        refresh_token: authDoc.refresh_token,
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_SECRET
    };
    //response from POST requestç
    const tokenResponse = await axios.post("https://id.twitch.tv/oauth2/token", {}, { params });
    //create a new custom token
    const new_custom_token = crypto.randomBytes(64).toString('hex');
    //Update access token and refresh tokens of old document
    authDoc.overwrite({
        userId: authDoc.userId,
        access_token: tokenResponse.data.access_token,
        refresh_token: tokenResponse.data.refresh_token,
        custom_token: new_custom_token
    });
    await authDoc.save();
    return authDoc;
}

//Authentication
router.get('/signin', (req, res) => {
    //Authentication to Twitch API using OAuth Authentication Flow
    const URL = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_CODE}&response_type=code&scope=${process.env.TWITCH_SCOPES}`;
    res.redirect(URL);
});

//Get authorization code from query parameter, get and store OAuth access token in database, then generate a NEW access token for the client and save to database
router.get('/generate-token', async ({ query: { code } }, res) => {
    try {
        //parameters for POST request to get access token
        const params = {
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: process.env.TWITCH_REDIRECT_CODE
        };
        const tokenResponse = await axios.post("https://id.twitch.tv/oauth2/token", {}, { params });
        //OAuth access token
        const access_token = tokenResponse.data.access_token;
        //OAuth refresh token
        const refresh_token = tokenResponse.data.refresh_token;
        const getUserURL = 'https://api.twitch.tv/helix/users';
        //Headers for Get Users request for Twitch API
        let getUserRequestHeaders = {
            headers: {
                'client-id': process.env.TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${access_token}`
            }
        };
        const userResponse = await axios.get(getUserURL, getUserRequestHeaders);
        //Get the user id from the response
        const userId = userResponse.data.data[0].id;
        //Generate random 200 character long random string to use as custom access token
        const custom_token = crypto.randomBytes(64).toString('hex'); //URL-friendly
        //Save to MongoDB database
        const authDoc = new AuthInfo({
            userId: userId,
            access_token: access_token,
            refresh_token: refresh_token,
            custom_token: custom_token
        });
        //Save auth document to mongodb
        //await authDoc.save(); //UNCOMMENT TO SAVE TO DB
        //Set the custom token as a cookie to be sent back to client
        res.cookie("custom_token", custom_token);
        res.send('');
    } catch (error) {
        console.error(error);
    }
});

router.get('/cookie', (req, res) => {
    console.log(req.cookies);
});

module.exports = router;