import { useState } from "react";
import { useDispatch } from 'react-redux';
import { useEffect } from "react";
import { timeIsUp } from "./redux/isTimeUpSlice";
import axios from "axios";
//enable to get and send cookies
axios.defaults.withCredentials = true;

const Timer = (props) => {
    //props.time
    //time remaining on the timer in seconds
    const [timeRemaining, setTimeRemaining] = useState(null);
    //timeObj has properties h, m, and s, representing hours, minutes, seconds, respectively
    const [timeObj, setTimeObj] = useState(null);
    //value returned by setInterval, needed to clear interval
    const [intervalResponse, setIntervalResponse] = useState(null);
    //state to indicate when time state is first set (to start timer)
    const [isTimeSet, setIsTimeSet] = useState(false);
    //whether or not timer has finished
    const [timeFinished, setTimeFinished] = useState(false);
    //Dispatch hook to call action on reducer
    const dispatch = useDispatch();
    //Converts current time in seconds to a time object
    const getTimeObjFromSec = (sec) => {
        const hours = Math.floor(sec / 3600);
        const minsLeftoverInSec = sec % 3600;
        const mins = Math.floor(minsLeftoverInSec / 60);
        const secs = Math.ceil(minsLeftoverInSec % 60);
        return {
            h: hours,
            m: mins,
            s: secs
        };
    }
    //Converts current time object to time in seconds
    const getSecFromTimeObj = (timeObject) => {
        return timeObject.h * 3600 + timeObject.m * 60 + timeObject.s;
    }
    //Starts the timer
    const decrementTimer = () => {
        //NOTE: need to use functions in setState or else value will always remain what it was during first call
        setTimeRemaining(timeRemaining => timeRemaining - 1);
        setTimeObj(timeObj => {
            const currSec = getSecFromTimeObj(timeObj);
            return getTimeObjFromSec(currSec - 1);
        });
    };
    //Called when component first mounts
    useEffect(() => {
        //Set the time remaining and time object, given that props.time is in mins
        const timeInSec = props.time * 60;
        setTimeRemaining(timeInSec);
        setTimeObj(getTimeObjFromSec(timeInSec));
        setIsTimeSet(true);

    }, []);
    //Called when isTimeSet state changes
    useEffect(() => {
        if (isTimeSet) {
            setIntervalResponse(setInterval(decrementTimer, 1000));
        }
    }, [isTimeSet]);
    //Called when intervalResponse state changes (including mounting)
    useEffect(() => {
        //Called when state updates, cleanup last state (including unmounting)
        return () => {
            if (intervalResponse) { //Only happens when user leaves the page early/time is up
                clearInterval(intervalResponse); //clears the interval
                const data = {
                    broadcasterId: props.broadcasterId,
                    timeWatched: props.time
                };
                axios.post("http://localhost:8000/api/twitch/updateTimeWatchedForBroadcaster", data).then(res => {
                    console.log(res);
                }).catch(error => {
                    console.error(error);
                });
            }
        }
    }, [intervalResponse]);
    //Called when timeRemaining changes, use to access timeRemaining state as it changes
    useEffect(() => {
        if (timeRemaining === 0) {
            setTimeFinished(true);
        }
    }, [timeRemaining]);
    //Called when timer has finished (ticked down to 0)
    useEffect(() => {
        if (timeFinished) {
            clearInterval(intervalResponse);
            //Set the state isTimeUp to true
            dispatch(timeIsUp());
        }
    }, [timeFinished]);

    return (<div className="timer">
        <div className="timerNumbers">
            {timeObj && <div>
                {timeObj.h < 10 ? '0' + timeObj.h : timeObj.h}<span className="separator">:</span>{timeObj.m < 10 ? '0' + timeObj.m : timeObj.m}<span className="separator">:</span>{timeObj.s < 10 ? '0' + timeObj.s : timeObj.s}
            </div>}
        </div>
    </div>);
}

export default Timer;