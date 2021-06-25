const express = require('express');
const axios = require('axios');
const AuthInfo = require('../models/authInfo');
var router = express.Router();
//require('cookie-parser');

//Uses custom_token cookie value to fetch AuthInfo object from database
const getAuthInfoFromToken = async (custom_token) => {
    const [authDoc] = await AuthInfo.find({ custom_token: custom_token });
    return authDoc;
}

//Refreshes access token using the refresh token, returns new token
const refreshAccessToken = async (custom_token) => {
    try {
        //Find the AuthInfo entry from database
        const [authDoc] = await AuthInfo.find({ custom_token: custom_token });
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
        return authDoc.custom_token;
    } catch (error) {
        console.error(error);
    }
}

//Fetches and returns list of followed streams
const getFollowedStreams = async (custom_token) => {
    //Get auth info document from cookie
    try {
        const authInfo = await getAuthInfoFromToken(custom_token);
        //URL for get request to get followed streamers
        const getFollowedStreamsURL = "https://api.twitch.tv/helix/streams/followed";
        const getFollowedStreamsHeader = {
            'client-id': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${authInfo.access_token}`
        };
        const getFollowedStreamsParams = {
            user_id: authInfo.userId
        }
        const followedStreamsResponse = await axios.get(getFollowedStreamsURL, {
            headers: getFollowedStreamsHeader,
            params: getFollowedStreamsParams
        });
        const followedStreamsArr = followedStreamsResponse.data.data;
        return followedStreamsArr
    } catch (error) {
        //If 401 error, use refresh token to refresh access token
        if (error.response && error.response.hasOwnProperty("data") && error.response.data.hasOwnProperty("status") && error.response.data.status === 401) {
            //Get custom_token from cookie
            const customToken = req.cookies.custom_token;
            const newCustomToken = await refreshAccessToken(customToken);
            //Call function again with new token
            return getFollowedStreams(newCustomToken);
        } else {
            console.error(error);
        }
    }
}

router.get('/getFollowedStreams', async (req, res) => {
    //Get custom_token from cookie using cookie-parser middleware
    const custom_token = req.cookies.custom_token;
    const followedStreamsArr = await getFollowedStreams(custom_token);
    res.send(followedStreamsArr);
});

module.exports = router;