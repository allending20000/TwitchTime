import { useState, useEffect } from "react";
import axios from "../../backend/node_modules/axios";
import Entry from "./Entry.js";
import AddChannel from "./AddChannel";
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
        axios.get("http://localhost:8000/api/twitch/getFollowedStreams").then(res => {
            //update the data state
            console.log(res);
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
        <AddChannel />
    </div>);
}

export default Dashboard;