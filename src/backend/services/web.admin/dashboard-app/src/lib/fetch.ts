import { CatalogItems, CatalogItemsScheme, Categories, CategoriesScheme } from "./types/catalog";
import { Orders } from "./types/order";

export type SelectProduct = {
  status: "active" | "inactive" | "archived";
  id: number;
  imageUrl: string;
  name: string;
  price: number;
  currency: string;
  availableAt: Date;
}

export type SelectProducts = {
  newOffset: number | null;
  totalProducts: number;
  products: SelectProduct[];
}


export async function fetchCatalogs(search: string, offset: number, productsPerPage: number): Promise<SelectProducts> {
  const apiUrl = `${process.env.INTERNAL_API_BASE_URL}/catalog/items/all?offset=${offset}&limit=${productsPerPage}`;
  
  const items = await fetchItems(apiUrl);

  return {
    newOffset: items.offset + items.limit,
    totalProducts: items.total,
    products: items.catalog_items.map((item) => {
      return {
        status: 'active',
        id: item.id,
        imageUrl: item.image,
        name: item.name,
        price: item.price,
        currency: item.currency,
        availableAt: new Date(),
      };
    }),
  };
}

export async function fetchCatalogItemsByCategory(category: string): Promise<CatalogItems> {
  const apiUrl = process.env.INTERNAL_API_BASE_URL + `/catalog/items/all?category_name=${category}`;
  return await fetchItems(apiUrl);
}

async function fetchItems(apiUrl: string) {
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch catalog items data');
  }

  const items: CatalogItems = CatalogItemsScheme.parse(await res.json());
  const catalog_items = items.catalog_items.map((item) => {
    return {
      ...item,
      image: process.env.INTERNAL_API_BASE_URL + item.image
    };
  });

  return { ...items, catalog_items };
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

export async function fetchOrders(offset: number, limit: number): Promise<Orders> {
  const apiUrl = `${process.env.INTERNAL_API_BASE_URL}/order/api/v1/orders?offset=${offset}&limit=${limit}`;
  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error('Failed to fetch orders data');
  }

  const orders = await res.json();
  return orders;
}