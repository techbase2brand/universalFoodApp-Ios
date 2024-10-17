import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { atom, useAtom } from 'jotai';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import useShopify from '../hooks/useShopify';
import { useConfig } from './Config';
import { createBuyerIdentityCartInput } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Context {
  cartId: string | undefined;
  checkoutURL: string | undefined;
  totalQuantity: number;
  addingToCart: Set<string>;
  clearCart: () => void;
  addToCart: (variantId: string) => Promise<void>;
  removeFromCart: (variantId: string) => Promise<void>;
  removeOneFromCart: (variantId: string) => void;
}

const defaultCartId = undefined;
const defaultCheckoutURL = undefined;
const defaultTotalQuantity = 0;

const CartContext = createContext<Context>({
  cartId: defaultCartId,
  checkoutURL: undefined,
  totalQuantity: 0,
  addingToCart: new Set(),
  addToCart: async () => { },
  removeFromCart: async () => { },
  removeOneFromCart: () => { },
  clearCart: () => { },
});

type AddingToCartAction =
  | { type: 'add'; variantId: string }
  | { type: 'remove'; variantId: string };

const checkoutURLState = atom<Context['checkoutURL']>(defaultCheckoutURL);
const cartIdState = atom<Context['cartId']>(defaultCartId);
const totalQuantityState = atom<Context['totalQuantity']>(defaultTotalQuantity);

export const CartProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const ShopifyCheckout = useShopifyCheckoutSheet();
  // Reuse the same cart ID for the lifetime of the app
  const [checkoutURL, setCheckoutURL] = useAtom(checkoutURLState);
  // Reuse the same cart ID for the lifetime of the app
  const [cartId, setCartId] = useAtom(cartIdState);
  // Keep track of the number of items in the cart
  const [totalQuantity, setTotalQuantity] = useAtom(totalQuantityState);
  // Maintain a loading state for items being added to the cart
  const addingToCartReducer = (
    state: Set<string>,
    action: AddingToCartAction,
  ): Set<string> => {
    switch (action.type) {
      case 'add':
        return new Set([...state, action.variantId]);
      case 'remove':
        return new Set([...state].filter(id => id !== action.variantId));
      default:
        throw new Error();
    }
  };
  // Maintain a loading state for items being added to the cart
  const defaultSet: Set<string> = new Set();
  const [addingToCart, dispatch] = useReducer(addingToCartReducer, defaultSet);
  const { appConfig } = useConfig();

  const { mutations, queries } = useShopify();
  const [createCart] = mutations.cartCreate;
  const [addLineItems] = mutations.cartLinesAdd;
  const [removeLineItems] = mutations.cartLinesRemove;
  const [cartLinesUpdate] = mutations.cartLinesUpdate;
  const [fetchCart] = queries.cart;

  const clearCart = useCallback(() => {
    setCartId(defaultCartId);
    setCheckoutURL(undefined);
    setTotalQuantity(0);
  }, [setCartId, setCheckoutURL, setTotalQuantity]);

  useEffect(() => {
    const subscription = ShopifyCheckout.addEventListener('completed', () => {
      // Clear the cart ID and checkout URL when the checkout is completed
      clearCart();
    });

    return subscription?.remove;
  }, [ShopifyCheckout, clearCart, setCartId, setCheckoutURL, setTotalQuantity]);

  useEffect(() => {
    async function getCart() {
      try {
        const { data } = await fetchCart({
          variables: {
            cartId,
          },
        });
        if (data?.cart.totalQuantity) {
          setTotalQuantity(data?.cart.totalQuantity);
        }
      } catch { }
    }

    if (cartId) {
      getCart();
    }
  }, [cartId, fetchCart, setTotalQuantity]);

  useEffect(() => {
    const loadCartState = async () => {
      try {
        const savedCartId = await AsyncStorage.getItem('cartId');
        const savedCheckoutURL = await AsyncStorage.getItem('checkoutURL');
        const savedTotalQuantity = await AsyncStorage.getItem('totalQuantity');

        if (savedCartId) setCartId(savedCartId);
        if (savedCheckoutURL) setCheckoutURL(savedCheckoutURL);
        if (savedTotalQuantity) setTotalQuantity(parseInt(savedTotalQuantity, 10));
      } catch (error) {
        console.error('Error loading cart state from AsyncStorage:', error);
      }
    };

    loadCartState();
  }, []);

  // Save cart state to async storage whenever it changes
  useEffect(() => {
    const saveCartState = async () => {
      try {
        await AsyncStorage.setItem('cartId', cartId || '');
        await AsyncStorage.setItem('checkoutURL', checkoutURL || '');
        await AsyncStorage.setItem('totalQuantity', totalQuantity.toString());
      } catch (error) {
        console.error('Error saving cart state to AsyncStorage:', error);
      }
    };

    saveCartState();
  }, [cartId, checkoutURL, totalQuantity]);


  const addToCart = useCallback(
    async (variantId: string, quantityToAdd: number) => {
      let id = cartId;

      dispatch({ type: 'add', variantId });

      if (!id) {
        const cartInput = createBuyerIdentityCartInput(appConfig);
        const cart = await createCart({ variables: { input: cartInput } });
        id = cart.data.cartCreate.cart.id;

        if (id) {
          setCartId(id);
        }
      }

      const { data } = await addLineItems({
        variables: {
          cartId: id,
          lines: [{ quantity: quantityToAdd, merchandiseId: variantId }],
        },
      });
      console.log(`Added ${quantityToAdd} of variant ${variantId} to cart`);
      dispatch({ type: 'remove', variantId });
      setCheckoutURL(data.cartLinesAdd.cart.checkoutUrl);
      console.log("Checkout URL after adding to cart:", data.cartLinesAdd.cart.checkoutUrl);
      // setCheckoutURL("https://lovedrink.uk/cart/c/Z2NwLWV1cm9wZS13ZXN0MzowMUhZQVJORlZUUFlYM1RaWjFQUzY2R1lLSA?key=c05ccd2a9f1145266654a9c1d471a998/information");
      // setTotalQuantity(data.cartLinesAdd.cart.totalQuantity);
      setTotalQuantity(prevQuantity => prevQuantity + quantityToAdd);

      if (data.cartLinesAdd.cart.checkoutUrl) {
        ShopifyCheckout.preload(data.cartLinesAdd.cart.checkoutUrl);
      }

      if (id) {
        fetchCart({
          variables: {
            cartId: id,
          },
        });
      }
    },
    [
      cartId,
      addLineItems,
      setCheckoutURL,
      setTotalQuantity,
      appConfig,
      createCart,
      setCartId,
      ShopifyCheckout,
      fetchCart,
    ],
  );

  const removeFromCart = useCallback(
    async (variantId: string) => {
      if (!cartId) {
        return;
      }

      dispatch({ type: 'add', variantId });

      const { data } = await removeLineItems({
        variables: {
          cartId,
          lineIds: [variantId],
          // lineIds: Array(quantityToRemove).fill(variantId),
        },
      });
      setCheckoutURL(data.cartLinesRemove.cart.checkoutUrl);
      setTotalQuantity(data.cartLinesRemove.cart.totalQuantity);
      // setTotalQuantity(prevQuantity => prevQuantity - quantityToRemove);

      if (checkoutURL) {
        ShopifyCheckout.preload(checkoutURL);
      }

      if (cartId) {
        await fetchCart({
          variables: {
            cartId,
          },
        });
      }

      dispatch({ type: 'remove', variantId });
    },
    [
      cartId,
      removeLineItems,
      setCheckoutURL,
      setTotalQuantity,
      checkoutURL,
      ShopifyCheckout,
      fetchCart,
    ],
  );

  // const removeOneFromCart = useCallback(
  //   async (variantId: string, quantityToRemove: number) => {
  //     let id = cartId;
  //     console.log("cartid:::", cartId)
  //     dispatch({ type: 'add', variantId });

  //     if (!id) {
  //       // Handle scenario where cartId is not available
  //       return;
  //     }
  //     console.log(`Attempting to remove ${quantityToRemove} of variant ${variantId} from cart`);

  //     const { data } = await cartLinesUpdate({
  //       variables: {
  //         cartId: cartId,
  //         // lines: [{ quantity: quantityToRemove, merchandiseId: variantId }], // Use negative quantity to remove items
  //         lines: [{ id: variantId, quantity: quantityToRemove }],
  //       },
  //     });

  //     console.log(`Removed ${quantityToRemove} of variant ${variantId} from cart`);

  //     dispatch({ type: 'remove', variantId });

  //     // Update checkout URL and total quantity if needed
  //     setCheckoutURL(data.cartLinesUpdate.cart.checkoutUrl);
  //     setTotalQuantity(data.cartLinesUpdate.cart.totalQuantity);

  //     // Preload checkout if URL is available
  //     if (data.cartLinesUpdate.cart.checkoutUrl) {
  //       ShopifyCheckout.preload(data.cartLinesUpdate.cart.checkoutUrl);
  //     }

  //     // Fetch updated cart details
  //     fetchCart({ variables: { cartId: id } });
  //   },
  //   [
  //     cartId,
  //     cartLinesUpdate,
  //     setCheckoutURL,
  //     setTotalQuantity,
  //     ShopifyCheckout,
  //     fetchCart,
  //   ],
  // );

  const removeOneFromCart = useCallback(
    async (variantId: string, quantityToRemove: number) => {
      let id = cartId;
      console.log("cartid:::", cartId);

      // Check if variantId and quantityToRemove are valid
      if (!variantId || quantityToRemove <= 0) {
        console.error("Invalid variantId or quantityToRemove:", variantId, quantityToRemove);
        return;
      }

      dispatch({ type: 'add', variantId });

      if (!id) {
        // Handle scenario where cartId is not available
        console.error("Cart ID is not available");
        return;
      }

      console.log(`Attempting to remove ${quantityToRemove} of variant ${variantId} from cart`);

      try {
        const { data, errors } = await cartLinesUpdate({
          variables: {
            cartId: id,
            lines: [{ id: variantId, quantity: quantityToRemove }],
          },
        });

        // Log any errors returned by the mutation
        if (errors) {
          console.error("Mutation errors:", errors);
        }

        // Check if there are user errors in the response data
        if (data.cartLinesUpdate.userErrors.length > 0) {
          console.error("User Errors:", data.cartLinesUpdate.userErrors);
          return;
        }

        console.log(`Removed1111 ${quantityToRemove} of variant ${variantId} from cart`);

        dispatch({ type: 'remove', variantId });

        // Update checkout URL if available
        if (data.cartLinesUpdate.cart.checkoutUrl) {
          setCheckoutURL(data.cartLinesUpdate.cart.checkoutUrl);
          ShopifyCheckout.preload(data.cartLinesUpdate.cart.checkoutUrl);
        }

        // Fetch updated cart details
        fetchCart({ variables: { cartId: id } });
      } catch (error) {
        console.error("Error updating cart lines:", error);
      }
    },
    [
      cartId,
      cartLinesUpdate,
      setCheckoutURL,
      ShopifyCheckout,
      fetchCart,
    ]
  );


  const value = useMemo(
    () => ({
      cartId,
      checkoutURL,
      addToCart,
      removeFromCart,
      removeOneFromCart,
      totalQuantity,
      addingToCart,
      clearCart,
    }),
    [
      cartId,
      checkoutURL,
      addToCart,
      removeFromCart,
      removeOneFromCart,
      totalQuantity,
      addingToCart,
      clearCart,
    ],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => React.useContext(CartContext);
