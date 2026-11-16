"use client";
import { Button, Card } from "antd";
import Image from "next/image";
import Link from "next/link";
import { Stars } from "./Stars";

import {
  addToCart,
  CartItem,
  removeFromCart,
  toggleWishlistProduct,
} from "@/features/products/store/useProductsStore";
import { productInTheCart } from "@/features/products/utils/productInTheCart";
import { cn } from "@/lib/utils";
import {
  DeleteOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import { productInTheWishlist } from "@/features/products/utils/productInTheWishlist";
import { useAddProductIntoCart } from "@/hooks/useAddProductIntoCart";
import { message } from "antd";
import { useSession } from "next-auth/react";
import { useRemoveProductFromCart } from "@/hooks/useRemoveProductFromCart";
import { Product } from "@prisma/client";

const { Meta } = Card;

type ProductCardProps = {
  product: Product;
  redirectPath: string;
  cart: CartItem[];
  whistlist: Product[];
  isLoadingCart?: boolean;
};

export default function ProductCard({
  product,
  redirectPath,
  cart,
  whistlist,
  isLoadingCart = false,
}: ProductCardProps) {
  const { status } = useSession();
  const [messageApi, contextHolder] = message.useMessage();

  const percentage = Math.round(
    ((product.price - product.removedPrice) / product.price) * 100,
  );

  const inCart = productInTheCart(product.id, cart);

  const inWhishlist = productInTheWishlist(product.id, whistlist);

  const { mutationAddProductIntoCart, loadingAddProductIntoCart } =
    useAddProductIntoCart();

  const { mutationRemoveProductFromCart, loadingRemoveProductFromCart } =
    useRemoveProductFromCart();

  const handleCartToggle = async () => {
    if (isLoadingCart) return;
    if (status === "authenticated") {
      if (inCart) {
        mutationRemoveProductFromCart(product.id)
          .then(() => {
            messageApi.success("Product removed from cart");
          })
          .catch(() => {
            messageApi.error("Failed to remove product from cart");
          });
      } else {
        mutationAddProductIntoCart(product.id)
          .then(() => {
            messageApi.success("Product added to cart");
          })
          .catch(() => {
            messageApi.error("Failed to add product to cart");
          });
      }
    } else {
      if (inCart) {
        removeFromCart(product.id);
        messageApi.success("Product removed from cart");
      } else {
        addToCart(product);
        messageApi.success("Product added to cart");
      }
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlistProduct(product);

    if (inWhishlist) {
      messageApi.success("Product removed from wishlist");
    } else {
      messageApi.success("Product added to wishlist");
    }
  };

  if (!product) return null;

  return (
    <>
      {contextHolder}
      <Card
        className="animate-in fade-in mx-auto! w-full max-w-[270px] rounded-xl duration-500"
        cover={
          <div className="bg-surface-alt relative z-10 flex h-[250px] w-full items-center justify-center overflow-hidden rounded-t-xl">
            <Link href={redirectPath}>
              <img
                src={
                  Array.isArray(product.image) && product.image[0]?.img
                    ? product.image[0].img
                    : "https://placehold.co/600x400"
                }
                alt={product.name}
                className="absolute mx-auto h-full w-full max-w-[230px]! object-contain transition duration-300 ease-in-out hover:scale-110"
              />
            </Link>

            {/* Wishlist + View + Cart */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <Button
                onClick={handleToggleWishlist}
                className={cn(
                  "h-10! w-10! rounded-full! text-lg!",
                  inWhishlist ? "bg-accent-danger! text-white!" : "bg-white!",
                )}
              >
                <HeartOutlined />
              </Button>

              <Button
                className={cn(
                  "h-10! w-10! rounded-full! text-lg!",
                  inCart ? "bg-accent-danger! text-white!" : "bg-white!",
                )}
                data-cy={`add-to-cart-${product.id}`}
                onClick={handleCartToggle}
                loading={
                  loadingAddProductIntoCart ||
                  loadingRemoveProductFromCart ||
                  isLoadingCart
                }
              >
                {isLoadingCart ? (
                  ""
                ) : inCart ? (
                  <DeleteOutlined />
                ) : (
                  <ShoppingCartOutlined />
                )}
              </Button>
            </div>

            {/* Discount Badge */}
            {product.removedPrice && (
              <div className="bg-accent-danger absolute top-3 left-3 px-3 py-1">
                <p className="text-xs text-white">{percentage}%</p>
              </div>
            )}
          </div>
        }
      >
        {/* TITLE */}
        <Meta
          title={
            <Link href={redirectPath}>
              <h4 className="hover:text-text-muted truncate text-black transition">
                {product.name}
              </h4>
            </Link>
          }
        />

        {/* PRICES */}
        <div className="mt-3 flex items-center gap-3">
          <p className="text-accent-danger font-semibold">${product.price}</p>

          {product.removedPrice && (
            <p className="text-text-muted line-through">
              ${product.removedPrice}
            </p>
          )}
        </div>

        {/* RATING */}
        {product.rate && (
          <div className="mt-2 flex items-center gap-2">
            <Stars count={product.rate} />
            <p className="text-text-muted text-sm font-medium">(100)</p>
          </div>
        )}
      </Card>
    </>
  );
}
