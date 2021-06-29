const express = require('express');
const axios = require('axios');
const AuthInfo = require('../models/authInfo');
const TimeInfo = require('../models/timeInfo');
var router = express.Router();
//require('cookie-parser');

//Uses custom_token cookie value to fetch AuthInfo object from database
const getAuthInfoFromToken = async (custom_token) => {
    const [authDoc] = await AuthInfo.find({
        custom_token: custom_token
    });
    return authDoc;
}

//Uses userId and broadcasterId to fetch timeInfo document from database
const getTimeDocFromUserAndBroadcaster = async (userId, broadcasterId) => {
    const [timeDoc] = await TimeInfo.find({
        userId: userId,
        broadcasterId: broadcasterId
    });
    return timeDoc;
}

//Gets the userid given the custom token
const getUserIdFromCustomToken = async (custom_token) => {
    //Find the AuthInfo entry from database
    const authDoc = await getAuthInfoFromToken(custom_token);
    return authDoc.userId;
}

//Save streams to database as timeInfo documents, IF they don't already exist
const saveStreamsToDatabase = async (streamsArr, userId) => {
    for (let i = 0; i < streamsArr.length; i++) {
        const stream = streamsArr[i];
        const broadcasterId = stream.user_id;
        const docDoesExist = await TimeInfo.exists({
            userId: userId,
            broadcasterId: broadcasterId
        });
        if (!docDoesExist) {
            console.log("Hi");
            const timeDoc = new TimeInfo({
                userId: userId,
                broadcasterId: broadcasterId,
                timeWatched: "0"
            });
            await timeDoc.save();
        }
    }
}

//Refreshes access token using the refresh token, returns new token
const refreshAccessToken = async (custom_token) => {
    try {
        //Find the AuthInfo entry from database
        const authDoc = await getAuthInfoFromToken(custom_token);
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

//Fetches and returns list of followed streams as well as the user's id in the form [followed streams array, userid]
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
        return [followedStreamsArr, authInfo.userId]
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
};

//Fetches and returns URL of profile image for a user with given user_id
const getUserProfileImage = async (custom_token, user_id) => {
    try {
        const authInfo = await getAuthInfoFromToken(custom_token);
        //URL for get request to get followed streamers
        const getUserProfileImageURL = "https://api.twitch.tv/helix/users";
        const getUserProfileImageHeaders = {
            'client-id': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${authInfo.access_token}`
        };
        const getUserProfileImageParams = {
            id: user_id
        }
        const userProfileImageResponse = await axios.get(getUserProfileImageURL, {
            headers: getUserProfileImageHeaders,
            params: getUserProfileImageParams
        });
        const [userData] = userProfileImageResponse.data.data;
        const userProfileImage = userData.profile_image_url;
        return userProfileImage
    } catch (error) {
        //If 401 error, use refresh token to refresh access token
        if (error.response && error.response.hasOwnProperty("data") && error.response.data.hasOwnProperty("status") && error.response.data.status === 401) {
            //Get custom_token from cookie
            const customToken = req.cookies.custom_token;
            const newCustomToken = await refreshAccessToken(customToken);
            //Call function again with new token
            return getUserProfileImage(newCustomToken);
        } else {
            console.error(error);
        }
    }
};

router.get('/getFollowedStreams', async (req, res) => {
    try {
        //Get custom_token from cookie using cookie-parser middleware
        const custom_token = req.cookies.custom_token;
        const [followedStreamsArr, userId] = await getFollowedStreams(custom_token);
        await saveStreamsToDatabase(followedStreamsArr, userId);
        res.send(followedStreamsArr);
    } catch (error) {
        console.error(error);
    }
});

router.get('/getUserProfileImage', async (req, res) => {
    try {
        //Get custom_token from cookie using cookie-parser middleware
        const custom_token = req.cookies.custom_token;
        const userProfileImage = await getUserProfileImage(custom_token, req.query.broadcasterId);
        res.send(userProfileImage);
    } catch (error) {
        console.error(error);
    }
});

router.get('/getTimeWatched', async (req, res) => {
    try {
        //Get custom_token from cookie using cookie-parser middleware
        const custom_token = req.cookies.custom_token;
        //Get userId from the custom token
        const userId = await getUserIdFromCustomToken(custom_token);
        //Get the time watched from the timeInfo document
        const timeDoc = await getTimeDocFromUserAndBroadcaster(userId, req.query.broadcasterId);
        res.send(timeDoc.timeWatched);
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;