import { useHistory, useParams } from "react-router-dom";
import { useEffect } from "react";
import Timer from "./Timer";
import { useSelector } from 'react-redux';
import React from "react";

const User = () => {
    //Get the route parameters
    let { username, timeToWatch } = useParams();
    //Whether or not the time is up (when watching a channel)
    const isTimeUp = useSelector((state) => state.isTimeUp.value);

    //configurations for embedding Twitch
    const twitchConfigs = {
        width: 1281,
        height: 720,
        channel: username,
        // Only needed if this page is going to be embedded on other websites
        //parent: ["embed.example.com", "othersite.example.com"]
    };

    useEffect(() => {
        //credits to https://stackoverflow.com/questions/48724108/using-twitch-embedded-video-with-reactjs
        //create script element to load js file
        const script = document.createElement("script");
        script.src = "https://embed.twitch.tv/embed/v1.js";
        //when script loads, create a new Twitch embed object
        script.addEventListener("load", () => {
            new window.Twitch.Embed("twitch-embed", twitchConfigs);
        })
        //Add script tag as child in body element
        document.body.appendChild(script);
    }, [])

    return (<React.Fragment>
        {!isTimeUp ? <div className="user">
            <div id="twitch-embed"></div>
            <Timer time={timeToWatch} />
        </div> :
            <div className="userTimeUp">
                Time is up! Click the Home button to return to the dashboard.
            </div>}
    </React.Fragment>);
}

export default User;