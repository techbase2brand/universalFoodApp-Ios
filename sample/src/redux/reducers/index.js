import { combineReducers } from 'redux';
import wishlistReducer from './wishListReducer';
import authReducer from './authReducer';
import cartReducer from './cartReducer';
import menuReducer from './menuReducer';

const rootReducer = combineReducers({
  wishlist: wishlistReducer,
  auth: authReducer,
  cart: cartReducer,
  menu: menuReducer
});

export default rootReducer;
