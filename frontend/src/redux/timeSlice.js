import { createSlice } from '@reduxjs/toolkit'

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

export const timeSlice = createSlice({
    name: 'time',
    initialState: {
        value: null,
    },
    reducers: {
        increment: (state) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.value += 1
        },
        decrement: (state) => {
            state.value -= 1
        },
        setTime: (state, action) => {
            state.value = action.payload
        },
        startTimer: (state, action) => {

        }
    },
})

// Action creators are generated for each case reducer function
export const { increment, reset } = timeSlice.actions

export default timeSlice.reducer