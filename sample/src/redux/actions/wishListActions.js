
import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST,CLEAR_WISHLIST } from './types';

export const addToWishlist = (productId) => ({
  type: ADD_TO_WISHLIST,
  payload: { productId },
});

export const removeFromWishlist = (productId) => ({
  type: REMOVE_FROM_WISHLIST,
  payload: { productId },
});


export const clearWishlist = () => {
  return {
    type: CLEAR_WISHLIST,
  };
};
