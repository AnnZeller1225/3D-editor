const initialState = {
    percentLoading: null
}

const getPercent = (state, payload) => {
    return {
        ...state,
        percentLoading: payload
    };
}


const percentReset = (state) => {
    return {
        ...state,
        percentLoading: null
    };
}
const load = (state = initialState, action) => {
    switch (action.type) {

        case "PERCENT_LOAD":
            return getPercent(state, action.payload);

        case "PERCENT_RESET":
            return percentReset(state);

        default:
            return state;
    }
};
export default load;