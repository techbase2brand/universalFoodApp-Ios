import { SELECT_MENU_ITEM } from '../actions/types';

const initialState = {
  selectedItem: "Electronics",
};

const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case SELECT_MENU_ITEM:
      return {
        ...state,
        selectedItem: action.payload,
      };
    default:
      return state;
  }
};

export default menuReducer;
