const express = require('express');
const app = express()
const apiRoutes = require('./routes/api.js');
const authRoutes = require('./routes/auth.js');
const twitchRoutes = require('./routes/twitch.js');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");

const port = 8000;

//Connect to mongoDB
const databaseURI = "mongodb+srv://allen_251:pXALvP4WIvdzLyAG@twitchtimeapp.8ovxd.mongodb.net/TwitchTimeApp?retryWrites=true&w=majority";
//Avoid deprecation warnings
mongoose.connect(databaseURI, { 'useNewUrlParser': true, 'useUnifiedTopology': true }).then(result => {
    console.log("Database is connected!!!");
    //Only listen to requests after connecting
    //Listening on port 8000
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}).catch(err => {
    console.error(err);
});
//Need parameter to avoid CORS policy error when passing cookies
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/twitch', twitchRoutes);