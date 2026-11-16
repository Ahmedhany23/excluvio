"use client";

import ProductCard from "@/components/ui/ProductCard";
import { useGetCart } from "@/hooks/useGetCart";
import { Col, Row } from "antd";
import { useWishlist } from "../store/useProductsStore";
import { useGetProducts } from "../hooks/useGetProducts";
import { ProductFallbackLoader } from "@/features/home/components/loader/ProductFallbackLoader";

const ProductsGrid = () => {
  const { cart, isLoading } = useGetCart();
  const whishlist = useWishlist();
  const { products, isLoading: isLoadingProducts } = useGetProducts();

  if (isLoadingProducts) return <ProductFallbackLoader />;

  return (
    <Row data-cy="products-grid" gutter={[16, 16]} justify="center" align="middle">
      {products.map((product) => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
          <ProductCard
            product={product}
            redirectPath={`/products/${product.id}`}
            cart={cart}
            isLoadingCart={isLoading}
            whistlist={whishlist}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ProductsGrid;
