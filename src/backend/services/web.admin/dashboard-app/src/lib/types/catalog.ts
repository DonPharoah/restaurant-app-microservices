import { z } from 'zod';

export const CatalogItemScheme = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  currency: z.string()
});

export const CatalogItemsScheme = z.object({
  catalog_items: z.array(CatalogItemScheme),
  total: z.number(),
  offset: z.number(),
  limit: z.number()
});

export const CategoriesScheme = z.array(
  z.object({
    id: z.number(),
    name: z.string()
  })
);

export type CatalogItem = z.infer<typeof CatalogItemScheme>;
export type CatalogItems = z.infer<typeof CatalogItemsScheme>;
export type Categories = z.infer<typeof CategoriesScheme>;
