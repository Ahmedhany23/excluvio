import { CartItem } from "../features/products/store/useProductsStore";

function calculateCartTotal(cart?: CartItem[] | null): number {
  if (!Array.isArray(cart)) return 0;

  return cart.reduce((acc, item) => {
    const price = Number(item?.product?.price);
    const quantity = Number(item?.quantity) || 1;

    if (!Number.isFinite(price)) return acc; // skip broken items

    return acc + price * quantity;
  }, 0);
}

export default calculateCartTotal;
