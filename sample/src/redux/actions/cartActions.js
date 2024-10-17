import { ADD_TO_CART, REMOVE_FROM_CART,REMOVE_PRODUCT_FROM_CART,ADD_PRODUCT_TO_CART } from './types';

export const addProductToCart = (product) => {
  return {
    type: ADD_TO_CART,
    payload: product,
  };
};

export const removeProductFromCart = (productId) => {
  return {
    type: REMOVE_FROM_CART,
    payload: productId,
  };
};


// export const addProductInCart = (product) => ({
//   type: ADD_PRODUCT_TO_CART,
//   payload: product,
// });

// export const removeProductInCart = (productId) => ({
//   type: REMOVE_PRODUCT_FROM_CART,
//   payload: productId,
// });
