import {gql, useLazyQuery, useMutation} from '@apollo/client';
import type {Edges, ShopifyProduct, ShopifyCart,ShopifyCollection} from '../../@types';
import {getLocale} from '../utils';

const moneyFragment = gql`
  fragment Price on MoneyV2 {
    currencyCode
    amount
  }
`;

const productFragment = gql`
  fragment Product on ProductVariant {
    id
    price {
      ...Price
    }
    product {
      title
    }
    image {
      id
      width
      height
      url
    }
  }

  ${moneyFragment}
`;

const cartCostFragment = gql`
  fragment Cost on CartCost {
    subtotalAmount {
      ...Price
    }
    totalAmount {
      ...Price
    }
    totalTaxAmount {
      ...Price
    }
  }
`;

const PRODUCTS_QUERY = gql`
  query FetchProducts($country: CountryCode = CA,$first: Int)
  @inContext(country: $country) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          variants(first: 1) {
            edges {
              node {
                id
                unitPrice {
                  ...Price
                }
                price {
                  ...Price
                }
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                id
                width
                height
                url
              }
            }
          }
        }
      }
    }
  }

  ${moneyFragment}
`;
const COLLECTIONS_QUERY = gql`
  query FetchCollections($country: CountryCode = CA,$first: Int)
  @inContext(country: $country) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          image {
            id
            src
            url
          }
        }
      }
    }
  }
`;
const CART_QUERY = gql`
  query FetchCart($cartId: ID!, $country: CountryCode = CA)
  @inContext(country: $country) {
    cart(id: $cartId) {
      id
      totalQuantity
      cost {
        ...Cost
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ...Product
            }
            cost {
              totalAmount {
                ...Price
              }
            }
          }
        }
      }
    }
  }

  ${productFragment}
  ${moneyFragment}
  ${cartCostFragment}
`;

const CREATE_CART_MUTATION = gql`
  mutation CreateCart($input: CartInput, $country: CountryCode = CA)
  @inContext(country: $country) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart(
    $cartId: ID!
    $lines: [CartLineInput!]!
    $country: CountryCode = CA
  ) @inContext(country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
    }
  }
`;

const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart(
    $cartId: ID!
    $lineIds: [ID!]!
    $country: CountryCode = CA
  ) @inContext(country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
    }
  }
`;

const CART_LINES_UPDATE = gql`
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines {
          edges {
            node {
              id
              quantity
            }
          }
        }
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function useShopify() {
  const [, country] = getLocale().split('_');
  const includeCountry = {
    variables: {
      country,
    },
  };
  const products = useLazyQuery<{products: Edges<ShopifyProduct>}>(
    PRODUCTS_QUERY,
    includeCountry,
  );
  const collections = useLazyQuery<{ collections: Edges<ShopifyCollection> }>(
    COLLECTIONS_QUERY,
    includeCountry,
  );

  const cart = useLazyQuery<{cart: ShopifyCart}>(CART_QUERY, {
    fetchPolicy: 'network-only',
    ...includeCountry,
  });
  const cartCreate = useMutation(CREATE_CART_MUTATION, includeCountry);
  const cartLinesAdd = useMutation(ADD_TO_CART_MUTATION, includeCountry);
  const cartLinesRemove = useMutation(
    REMOVE_FROM_CART_MUTATION,
    includeCountry,
  );
  const cartLinesUpdate = useMutation(CART_LINES_UPDATE, includeCountry);

  return {
    queries: {
      cart,
      products,
      collections,
    },
    mutations: {
      cartCreate,
      cartLinesAdd,
      cartLinesRemove,
      cartLinesUpdate
    },
  };
}

export default useShopify;
