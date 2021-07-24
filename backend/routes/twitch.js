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
        //URL for get request to get info about a user
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

//Updates the time watched for a particular stream given user id of user and user id of broadcaster and time watched
const updateTimeWatchedForBroadcaster = async (userId, broadcasterId, timeWatched) => {
    try {
        const timeInfo = await getTimeDocFromUserAndBroadcaster(userId, broadcasterId);
        //Add to time watched field (NOTE: timeWatched is a string)
        const newTimeWatchedInt = parseInt(timeInfo.timeWatched) + parseInt(timeWatched);
        timeInfo.timeWatched = newTimeWatchedInt.toString();
        //Save to database
        await timeInfo.save();
    } catch (error) {
        console.error(error);
    }
}

//Follows a channel
const createUserFollow = async (customToken, broadcasterLogin) => {
    try {
        //Get authentication info from customToken for API calls
        const authInfo = await getAuthInfoFromToken(customToken);
        //URL to get info about broadcaster user
        const getBroadcasterInfoURL = "https://api.twitch.tv/helix/users";
        const getBroadcasterInfoHeaders = {
            'client-id': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${authInfo.access_token}`
        };
        const getBroadcasterInfoParams = {
            login: broadcasterLogin
        };
        const getBroadcasterInfoResponse = await axios.get(getBroadcasterInfoURL, {
            headers: getBroadcasterInfoHeaders,
            params: getBroadcasterInfoParams
        });
        //Get the response info about the broadcaaster
        const broadcasterInfo = getBroadcasterInfoResponse.data.data[0];
        //Follow the broadcaster now that their id is known
        //URL to follow the broadcaster
        const followBroadcasterURL = "https://api.twitch.tv/helix/users/follows";
        const followBroadcasterHeaders = {
            'client-id': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${authInfo.access_token}`,
            'Content-Type': 'application/json'
        };
        const followBroadcasterParams = {
            from_id: authInfo.userId, //user id of caller
            to_id: broadcasterInfo.id //user id of broadcaster
        };
        const followBroadcasterResponse = await axios.post(followBroadcasterURL, {}, {
            headers: followBroadcasterHeaders,
            params: followBroadcasterParams
        });
        console.log(followBroadcasterResponse);
    } catch (error) {
        console.error(error);
    }
}

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

router.post('/updateTimeWatchedForBroadcaster', async (req, res) => {
    try {
        //Get custom_token from cookie using cookie-parser middleware
        const custom_token = req.cookies.custom_token;
        //Get userId from the custom token
        const userId = await getUserIdFromCustomToken(custom_token);
        //Get the broadcaster and timeWatched fields from request data
        const broadcasterId = req.body.broadcasterId;
        const timeWatched = req.body.timeWatched; //express seems to convert this to a string
        //Update the time watched for the broadcaster
        await updateTimeWatchedForBroadcaster(userId, broadcasterId, timeWatched);
        res.send("Saved time watched");
    } catch (error) {
        console.error(error);
    }
});

router.post('/createUserFollow', async (req, res) => {
    try {
        //Get custom_token from cookie using cookie-parser middleware
        const custom_token = req.cookies.custom_token;
        //Get channel name field from request data
        const channelName = req.body.channelName;
        //Login name should be channel name but in lowercase
        const broadcasterLogin = channelName.toLowerCase();
        //Creates a follow for the broadcaster
        await createUserFollow(custom_token, broadcasterLogin);
        res.send("Created user follow");
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;