import { revalidateTag } from 'next/cache';
import { logger } from './logger';
import { Categories, CategoriesScheme, FoodItems, FoodItemsScheme } from './types/food-item';
import { CustomerOrder, OrderSchema } from './types/order';

export async function fetchFoodItems(): Promise<FoodItems> {
  const apiUrl = process.env.INTERNAL_API_BASE_URL + '/catalog/items/all';
  return await fetchItems(apiUrl);
}

export async function fetchFoodItemsByCategory(category: string): Promise<FoodItems> {
  const apiUrl = process.env.INTERNAL_API_BASE_URL + `/catalog/items/all?category_name=${category}`;
  return await fetchItems(apiUrl);
}

async function fetchItems(apiUrl: string) {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch catalog items data');
  }

  const items: FoodItems = FoodItemsScheme.parse(await res.json());
  const updatedItems = items.map((item) => {
    return {
      ...item,
      image: process.env.INTERNAL_API_BASE_URL + item.image
    };
  });

  return updatedItems;
}

export async function fetchCategories(): Promise<Categories> {
  const apiUrl = process.env.INTERNAL_API_BASE_URL + '/catalog/categories';
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch categories data');
  }

  const categories: Categories = CategoriesScheme.parse(await res.json());
  return categories;
}

export async function getUserInfo(userId: string) {
  const apiUrl = process.env.INTERNAL_API_BASE_URL + `/users/${userId}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch user info');
  }

  return await res.json();
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, retryCount = 5): Promise<any> {
  await sleep(1000);
  try {
    const response = await fetch(url, {
      next: { tags: ['retried'] },
      cache: 'no-store',
    });
    if (response.ok) {
      return await response.json();
    } else if (response.status === 500) {
      throw new Error('Server Error (500)');
    } else {
      // Handle other HTTP errors differently if needed
      throw new Error(`HTTP Error: ${response.status}`);
    }
  } catch (error) {
    logger.error(error, 'fetch failed');
    revalidateTag('retried')
    if (retryCount != 0) {
      return fetchWithRetry(url, retryCount - 1)
    } else {
      return error
    }
  }
}


export async function getOrderByTransactionID(transactionId: string): Promise<CustomerOrder> {
  const apiUrl = `${process.env.INTERNAL_API_BASE_URL}/order/api/v1/orders/find?transactionId=${transactionId}`;
  try {
    const data = await fetchWithRetry(apiUrl, 5);
    return OrderSchema.parse(data);
  } catch (error) {
    logger.error(error, 'failed to fetch order');
    throw new Error('Failed to fetch user orders');
  }
}
