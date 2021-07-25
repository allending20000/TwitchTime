require('dotenv').config();
const express = require('express')
const axios = require('axios');
var router = express.Router();

//Get authorization code from query parameter and get OAuth access token, then use Twitch API to get the user id, and then to get an array of live followed streams
router.get('/getFollowedStreams', async ({ query: { code } }, res) => {
    const getTokenURL = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.TWITCH_REDIRECT_CODE}`;
    const tokenResponse = await axios.post(getTokenURL);
    //Get the access token from the response
    const accessToken = tokenResponse.data.access_token;
    const getUserURL = 'https://api.twitch.tv/helix/users';
    let axiosHeaders = {
        headers: {
            'client-id': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`
        }
    };
    const userResponse = await axios.get(getUserURL, axiosHeaders);
    //Get the user id from the response
    const userID = userResponse.data.data[0].id;
    const getFollowedStreamsURL = `https://api.twitch.tv/helix/streams/followed?user_id=${userID}`;
    const followedStreamsResponse = await axios.get(getFollowedStreamsURL, axiosHeaders);
    const followedStreamsArr = followedStreamsResponse.data.data;
    res.send(followedStreamsArr);
});

module.exports = router;