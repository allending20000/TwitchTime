import { useState, useEffect } from "react";
import axios from "../../backend/node_modules/axios";
import Entry from "./Entry.js";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Dashboard = () => {
    const [data, setData] = useState(null);
    //Runs the first time component mounts
    useEffect(() => {
        axios.get("http://localhost:8000/api/twitch/getFollowedStreams").then(res => {
            //update the data state
            console.log(res);
            setData(res.data);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    return (<div className="dashboard">
        {data &&
            data.map(user => {
                return <div className="dashboard-entry" key={user.id}>
                    <Entry userName={user.user_name} viewerCount={user.viewer_count} userId={user.user_id} />
                </div>
            })
        }
    </div>);
}

export default Dashboard;