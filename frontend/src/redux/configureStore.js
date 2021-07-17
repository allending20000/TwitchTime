import { configureStore } from '@reduxjs/toolkit'
import isTimeUpReducer from './isTimeUpSlice';

export default configureStore({
    reducer: {
        isTimeUp: isTimeUpReducer
    },
})