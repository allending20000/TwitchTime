import { createSlice } from '@reduxjs/toolkit'

//Initially set to true so navbar buttons aren't disabled on other pages
const initialState = {
    value: true,
}
//Represents whether time is up when watching a certain channel
export const isTimeUpSlice = createSlice({
    name: 'isTimeUp',
    initialState,
    reducers: {
        //Call when time is up
        timeIsUp: (state) => {
            state.value = true
        },
        //Call when want to set state to False (timer starting)
        startTime: (state) => {
            state.value = false
        }
    },
})

// Action creators are generated for each case reducer function
export const { timeIsUp, startTime } = isTimeUpSlice.actions

export default isTimeUpSlice.reducer