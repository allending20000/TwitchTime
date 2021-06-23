import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import timeSlice from './timeSlice'

export default configureStore({
    reducer: {
        authReducer: authSlice,
        timeReducer: timeSlice
    },
})