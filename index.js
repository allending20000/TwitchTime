const express = require('express');
const app = express()
const apiRoutes = require('./routes/api.js');
const authRoutes = require('./routes/auth.js');
const twitchRoutes = require('./routes/twitch.js');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 8000;

//Connect to mongoDB
const databaseURI = process.env.MONGODB_CONNECTION_STRING;
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
//Need to receive json data from POST request
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/api', apiRoutes);
//authentication
app.use('/api/auth', authRoutes);
//twitch api calls
app.use('/api/twitch', twitchRoutes);

if (process.env.NODE_ENV === "production") {
    //If on heroku, serve react application from server
    app.use(express.static('client/build'));
    //Serve html files from react
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "client", "build", "index.html"));
    });
}