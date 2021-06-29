import { useState, useEffect } from "react";
import axios from "../../backend/node_modules/axios";
import Entry from "./Entry.js";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Dashboard = () => {
    //Array of followed streams
    const [followedStreams, setFollowedStreams] = useState(null);
    //Runs the first time component mounts
    useEffect(() => {
        axios.get("http://localhost:8000/api/twitch/getFollowedStreams").then(res => {
            //update the data state
            console.log(res);
            const followedStreamsArr = res.data;
            setFollowedStreams(followedStreamsArr);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (<div className="dashboard">
        {followedStreams &&
            followedStreams.map(user => {
                return <div className="dashboard-entry" key={user.id}>
                    <Entry userName={user.user_name} viewerCount={user.viewer_count} broadcasterId={user.user_id} />
                </div>
            })
        }
    </div>);
}

export default Dashboard;