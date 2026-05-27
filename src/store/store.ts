import { createStore } from 'redux';

const initialState = {};

const rootReducer = (state = initialState, action: any) => {
  switch (action.type) {
    default:
      return state;
  }
};

export const store = createStore(rootReducer);
