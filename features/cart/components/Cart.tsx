"use client";

import {
  Button,
  Card,
  Col,
  Divider,
  InputNumber,
  Popconfirm,
  Row,
  Skeleton,
  Table,
  TableProps,
} from "antd";

import calculateCartTotal from "@/lib/calculateCartTotal";
import Image from "next/image";
import Link from "next/link";
import {
  CartItem,
  decrement,
  increment,
  removeFromCart,
} from "../../products/store/useProductsStore";
import { useGetCart } from "@/hooks/useGetCart";
import { useRemoveProductFromCart } from "@/hooks/useRemoveProductFromCart";
import { useIncrementProduct } from "@/hooks/useIncrementProduct";
import { useDecrementProduct } from "@/hooks/useDecrementProduct";
import { useSession } from "next-auth/react";

const Cart = () => {
  const { cart, isLoading } = useGetCart();

  return (
    <Row gutter={[50, 50]} justify="center" align="middle">
      <Col data-cy={cart?.length ? "cart-table" : "cart-empty"} xs={24}>
        <CartTable cart={cart} isLoadingCart={isLoading} />
      </Col>
      <Col xs={24}>
        {/* Actions */}
        <div className="flex justify-between">
          <Link href="/">
            <Button size="large">Return To Shop</Button>
          </Link>
        </div>
      </Col>
      <Col xs={24} className="flex! justify-end">
        <CartDetails cart={cart} isLoadingCart={isLoading} />
      </Col>
    </Row>
  );
};

export default Cart;

const CartDetails = ({
  cart,
  isLoadingCart,
}: {
  cart: CartItem[];
  isLoadingCart?: boolean;
}) => {
  if (isLoadingCart) return <Skeleton active />;

  if (!cart?.length) return null;

  const subtotal = calculateCartTotal(cart);

  return (
    <Card
      title={
        <span className="font-poppins text-lg font-semibold">Cart Total</span>
      }
      className="w-full max-w-sm p-2"
    >
      {/* Subtotal */}
      <div className="font-poppins mb-2 flex justify-between text-sm">
        <span>Subtotal:</span>
        <span data-cy="cart-total">${subtotal.toFixed(2)}</span>
      </div>

      <Divider className="my-2" />

      {/* Shipping */}
      <div className="font-poppins mb-2 flex justify-between text-sm">
        <span>Shipping:</span>
        <span>Free</span>
      </div>

      <Divider className="my-2" />

      {/* Total */}
      <div className="font-poppins mb-4 flex justify-between text-sm">
        <span>Total:</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <Link href="/checkout">
        <Button type="primary" size="large" className="w-full">
          Process to checkout
        </Button>
      </Link>
    </Card>
  );
};

type CartTableItem = CartItem["product"] & { quantity: number };

const CartTable = ({
  cart,
  isLoadingCart,
}: {
  cart: CartItem[];
  isLoadingCart?: boolean;
}) => {
  const finalProduct: CartTableItem[] = (cart ?? [])
    .filter((item) => item?.product)
    .map((item) => ({
      ...item.product,
      quantity: item.quantity ?? 1,
    }));

  const { status } = useSession();

  const { mutationRemoveProductFromCart, loadingRemoveProductFromCart } =
    useRemoveProductFromCart();

  const { mutationIncrementProduct, loadingIncrementProduct } =
    useIncrementProduct();

  const { mutationDecrementProduct, loadingDecrementProduct } =
    useDecrementProduct();

  const handleQuantityChange = async (id: string, value: number) => {
    const product = cart?.find((i) => String(i.productId) === String(id));

    if (!product) return;

    const oldQty = product.quantity ?? 1;

    if (value <= 0) {
      if (status === "authenticated") {
        await mutationRemoveProductFromCart(id);
        return;
      } else {
        removeFromCart(id);
      }
      return;
    }

    const diff = value - oldQty;

    if (diff > 0) {
      if (status === "authenticated") {
        await mutationIncrementProduct(id);
      } else {
        increment(id);
      }
    } else if (diff < 0) {
      if (status === "authenticated") {
        await mutationDecrementProduct(id);
      } else {
        decrement(id);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (status === "authenticated") {
      await mutationRemoveProductFromCart(id);
    } else {
      removeFromCart(id);
    }
  };

  const columns: TableProps<CartTableItem>["columns"] = [
    {
      title: "Product",
      dataIndex: "title",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center gap-10">
          <img
            src={record?.image?.[0]?.img ?? "/placeholder.png"}
            alt={record.name ?? "product"}
            width={70}
            height={70}
            className="h-20 w-20 object-contain object-center"
          />
          <Link href={`/products/${record.id}`}>
            <p className="font-poppins hover:text-accent-danger font-semibold text-black">
              {record?.name}
            </p>
          </Link>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (value: number) => (
        <p className="font-poppins font-semibold text-black">${value}</p>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "qty",
      render: (qty, record) => (
        <InputNumber
          data-cy={`cart-quantity-${record.id}`}
          min={1}
          value={qty}
          onChange={(val) => {
            if (val === null) return;
            handleQuantityChange(record.id, val);
          }}
          disabled={loadingIncrementProduct || loadingDecrementProduct}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <p className="font-poppins font-semibold text-black">
          ${((record.quantity ?? 0) * (record.price ?? 0)).toFixed(2)}
        </p>
      ),
    },
    {
      title: "Options",
      key: "options",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to remove this item?"
          onConfirm={() => {
            handleDelete(record.id);
          }}
        >
          <Button
            data-cy={`cart-remove-${record.id}`}
            type="primary"
            danger
            loading={loadingRemoveProductFromCart}
            disabled={loadingRemoveProductFromCart}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={finalProduct}
      loading={isLoadingCart}
      rowKey="id"
      pagination={false}
      bordered={false}
      showHeader
      scroll={{
        x: "max-content",
      }}
    />
  );
};
