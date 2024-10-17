import { ADD_TO_CART, REMOVE_FROM_CART, ADD_PRODUCT_TO_CART, REMOVE_PRODUCT_FROM_CART } from '../actions/types';

const initialState = {
  cartItems: [],
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.id === item.id);
      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.id === existItem.id ? { ...item, quantity: x.quantity + 1 } : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...item, quantity: 1 }],
        };
      }

    case REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.id !== action.payload),
      };


    // case ADD_PRODUCT_TO_CART:
    //   return {
    //     ...state,
    //     cartItems: [...state.cartItems, action.payload],
    //   };
    // case REMOVE_PRODUCT_FROM_CART:
    //   return {
    //     ...state,
    //     cartItems: state.cartItems.filter(item => item.id !== action.payload),
    //   };
    default:
      return state;
  }
};

export default cartReducer;
