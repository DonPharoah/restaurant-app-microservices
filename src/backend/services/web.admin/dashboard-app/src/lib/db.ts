export function getProducts(search: string,
    offset: number) {
    return {
        newOffset: null,
        totalProducts: 0,
        products: [
            {
                id: 1,
                imageUrl:
                    'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp',
                name: 'Smartphone X Pro',
                status: 'active',
                price: '999.00',
                stock: 150,
                availableAt: new Date()
            },
            {
                id: 2,
                imageUrl:
                    'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp',
                name: 'Wireless Earbuds Ultra',
                status: 'active',
                price: '199.00',
                stock: 300,
                availableAt: new Date()
            }
        ] as SelectProduct[]
    }
}

export type SelectProduct = {
    status: "active" | "inactive" | "archived";
    id: number;
    imageUrl: string;
    name: string;
    price: string;
    stock: number;
    availableAt: Date;
}