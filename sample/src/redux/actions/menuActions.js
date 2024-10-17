import { SELECT_MENU_ITEM } from './types';

export const selectMenuItem = (menuItem) => ({
  type: SELECT_MENU_ITEM,
  payload: menuItem,
});
