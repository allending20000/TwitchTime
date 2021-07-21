import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../../backend/node_modules/axios";
import { FaMale } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { startTime } from './redux/isTimeUpSlice';
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Entry = (props) => {
    //URL of profile image
    const [profileImgUrl, setProfileImgUrl] = useState(null);
    //Time watched for current broadcaster
    const [timeWatched, setTimeWatched] = useState(null);
    //Time TO watch for broadcaster (form input)
    const [timeToWatch, setTimeToWatch] = useState(null);
    //Use to redirect to other pages
    const history = useHistory();
    //Dispatch hook to call action on reducer
    const dispatch = useDispatch();
    const isTimeUp = useSelector((state) => state.isTimeUp.value);
    useEffect(() => {
        try {
            //Fetches profile URL and time watched for the current broadcaster
            const fetchUrlAndTimeWatched = async () => {
                //Query parameters
                const params = {
                    broadcasterId: props.broadcasterId
                }
                //Fetch the profile image URL for each user
                const urlResponse = await axios.get("http://localhost:8000/api/twitch/getUserProfileImage", { params: params });
                const url = urlResponse.data;
                const timeResponse = await axios.get("http://localhost:8000/api/twitch/getTimeWatched", { params: params });
                const time = timeResponse.data.toString(); //convert to string so it isn't considered falsy when rendering
                setProfileImgUrl(url);
                setTimeWatched(time);
            }
            fetchUrlAndTimeWatched();
        } catch (error) {
            console.error(error);
        }
    }, []);

    //handle submit event for the form
    const handleSubmit = (e) => {
        //Prevent page from refreshing
        e.preventDefault();
        //Go to 
        history.push(`/user/${props.userName}/${timeToWatch}`);
        //Set isTimeUp state to false so navbar links are disabled
        dispatch(startTime());
        console.log(isTimeUp);
    }

    //handle changing timeToWatch state
    const handleTimeToWatchChange = (e) => {
        setTimeToWatch(e.target.value);
    }

    return (<div>
        {profileImgUrl && timeWatched &&
            <div className="entry">
                <div className="entrycontent">
                    <div className="entryimg">
                        <img src={profileImgUrl} alt="Channel Profile" className="profileimage" />
                    </div>
                    <div className="entrytext">
                        <div className="toprow">
                            <div className="username">{props.userName}</div>
                            <div className="viewercount"><FaMale />{props.viewerCount}</div>
                        </div>
                        <div className="bottomrow">
                            <div className="gameName">{props.gameName}</div>
                            <div className="timeWatched">Watched: {timeWatched} min</div>
                            <form className="timeform" onSubmit={handleSubmit}>
                                <input type="number" value={timeToWatch || ""} placeholder="Minutes to Watch" onChange={handleTimeToWatchChange} min="1" required />
                                <button>Watch</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>);
}

export default Entry;