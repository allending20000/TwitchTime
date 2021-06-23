require('dotenv').config();
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require("crypto");
const AuthInfo = require("../models/authInfo");

var router = express.Router();

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
        }
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
        //Generate random 200 character long random string to us as custom access token
        const custom_token = crypto.randomBytes(64).toString('hex'); //URL-friendly
        //Save to MongoDB database
        const authDoc = new AuthInfo({
            userId: userId,
            access_token: access_token,
            refresh_token: refresh_token,
            custom_token: custom_token
        });
        const savedAuthInfo = await authDoc.save();
        console.log(userId);
        console.log(access_token);
        console.log(refresh_token);
        console.log(custom_token);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;