import http from "k6/http";
import { check, sleep } from "k6";
import faker from "k6/x/faker";

export const options = {
  vus: 100,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<600"],
  },
};

const baseUrl = "http://traefik:80";
const cartUrl = baseUrl + "/shoppingcart";
const catalogUrl = baseUrl + "/catalog";
const checkoutUrl = baseUrl + "/checkout";

export default function () {
  const getFoods = http.get(catalogUrl + "/items/all");
  check(getFoods, {
    "get catalog items status was 200": (r) => r.status == 200,
  });

  if (getFoods.status != 200) {
    return;
  }

  const foods = getFoods.json();

  const getCartItems = (catalogItems) => {
    const cartItems = [];
    for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
      const item =
        catalogItems[Math.floor(Math.random() * catalogItems.length)];
      cartItems.push({
        img: item.image,
        item_id: item.id,
        product_description: item.description,
        product_name: item.name,
        quantity: Math.floor(Math.random() * 20),
        unit_price: item.price,
      });
    }
    return cartItems;
  };

  const user_id = faker.string.uuid();

  // create new cart
  const createCart = http.post(
    cartUrl + "/api/v1/cart",
    JSON.stringify({
      items: getCartItems(foods.catalog_items),
      user_id,
    })
  );

  check(createCart, {
    "create new cart was 200": (r) => r.status == 200,
  });

  // checkout
  const newCart = createCart.json();

  const checkoutBody = JSON.stringify({
    address: {
      city: faker.address.city(),
      country: faker.address.country(),
      state: faker.address.state(),
      street_address: faker.address.street(),
      zip_code: Number(faker.address.zip()),
    },
    credit_card: {
      name_on_card: faker.person.name(),
      credit_card_cvv: Number(faker.payment.creditCardCVV()),
      credit_card_expiration_month: Number(faker.payment.creditCardExpMonth()),
      credit_card_expiration_year: Number(faker.payment.creditCardExpYear()),
      credit_card_number: "4111111111111111",
    },
    user_id,
    email: faker.person.email(),
    user_currency: faker.payment.currencyShort(),
    cart_id: newCart.id,
  });

  const checkout = http.post(checkoutUrl + "/api/v1/checkout", checkoutBody, {
    headers: { "Content-Type": "application/json" },
  });
  check(checkout, {
    "checkout was 200": (r) => r.status == 200,
  });
}
