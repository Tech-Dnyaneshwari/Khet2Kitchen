/**
 * In-memory working database for mock mode.
 *
 * We shallow-clone the seed arrays so mutations made during a session (adding a
 * product, placing an order, marking a notification read) persist for that
 * session without editing the original seed. When the live backend is wired up,
 * services bypass this entirely.
 */

import {
  farmers as seedFarmers,
  notifications as seedNotifications,
  orders as seedOrders,
  products as seedProducts,
  requirements as seedRequirements,
  restaurants as seedRestaurants,
  reviews as seedReviews,
} from '@/data/mockData';
import type {
  Farmer,
  Notification,
  Order,
  Product,
  Requirement,
  Restaurant,
  Review,
} from '@/types';

interface Db {
  farmers: Farmer[];
  restaurants: Restaurant[];
  products: Product[];
  orders: Order[];
  requirements: Requirement[];
  notifications: Notification[];
  reviews: Review[];
}

export const db: Db = {
  farmers: [...seedFarmers],
  restaurants: [...seedRestaurants],
  products: [...seedProducts],
  orders: [...seedOrders],
  requirements: [...seedRequirements],
  notifications: [...seedNotifications],
  reviews: [...seedReviews],
};
