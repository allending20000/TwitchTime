import { useState, useEffect } from "react";
import axios from "axios";
import Entry from "./Entry.js";
import { useDispatch } from 'react-redux';
import { timeIsUp } from "./redux/isTimeUpSlice";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Dashboard = () => {
    //Array of followed streams
    const [followedStreams, setFollowedStreams] = useState(null);
    //Dispatch hook to call action on reducer
    const dispatch = useDispatch();

    //Runs the first time component mounts
    useEffect(() => {
        axios.get("/api/twitch/getFollowedStreams").then(res => {
            //update the data state
            //If no streams are followed, get back empty array
            const followedStreamsArr = res.data;
            setFollowedStreams(followedStreamsArr);
            //Set the state isTimeUp to true so navbar links display
            dispatch(timeIsUp());
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (<div className="dashboard">
        {followedStreams &&
            followedStreams.map(user => {
                return <div className="dashboard-entry" key={user.id}>
                    <Entry userName={user.user_name} viewerCount={user.viewer_count} broadcasterId={user.user_id} gameName={user.game_name} />
                </div>
            })
        }
        {/*Only appears when followedStreams is an empty array*/}
        {followedStreams && followedStreams.length === 0 &&
            <div className="noActiveChannelFollowed">No channels that you follow are live! Follow a live channel on Twitch to start using the app.</div>
        }
    </div>);
}

export default Dashboard;