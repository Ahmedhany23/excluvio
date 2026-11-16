"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu, Input, Badge, Button, Collapse } from "antd";
import {
  FilterOutlined,
  TagOutlined,
  DollarOutlined,
  DownOutlined,
  ClearOutlined,
  MobileOutlined,
  LaptopOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  AudioOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

const categories = [
  { id: "phones", label: "Phones", icon: <MobileOutlined /> },
  { id: "computers", label: "Computers", icon: <LaptopOutlined /> },
  { id: "smartWatch", label: "Smart Watch", icon: <ClockCircleOutlined /> },
  { id: "camera", label: "Camera", icon: <CameraOutlined /> },
  { id: "headPhones", label: "Headphones", icon: <AudioOutlined /> },
  { id: "gaming", label: "Gaming", icon: <VideoCameraOutlined /> },
];

export default function ProductMenuFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("min") ?? "",
    max: searchParams.get("max") ?? "",
  });

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const selectedCategoryKeys = useMemo(() => {
    const url = searchParams.get("categories");
    return url ? url.split(",") : [];
  }, [searchParams]);

  const handleCategoryChange = (keys: string[]) => {
    if (keys.length > 0) params.set("categories", keys.join(","));
    else params.delete("categories");

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleaned = value.replace(/\D/g, "");

    setPriceRange((prev) => ({ ...prev, [name]: cleaned }));

    if (cleaned) params.set(name, cleaned);
    else params.delete(name);

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    params.delete("categories");
    params.delete("min");
    params.delete("max");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    selectedCategoryKeys.length > 0 || priceRange.min || priceRange.max;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-lg" />
          <h2 className="m-0 text-lg font-semibold text-gray-800">Filters</h2>
          {hasActiveFilters && (
            <Badge
              count={
                selectedCategoryKeys.length +
                (priceRange.min ? 1 : 0) +
                (priceRange.max ? 1 : 0)
              }
              style={{ backgroundColor: "var(--color-accent-danger)" }}
            />
          )}
        </div>
        {hasActiveFilters && (
          <Button
            data-cy="clear-filters"
            type="link"
            size="small"
            icon={<ClearOutlined />}
            onClick={clearFilters}
            className="text-red-500! hover:text-red-600!"
          >
            Clear all
          </Button>
        )}
      </div>
      <Menu
        mode="inline"
        multiple
        selectedKeys={selectedCategoryKeys}
        onSelect={({ selectedKeys }) =>
          handleCategoryChange(selectedKeys as string[])
        }
        onDeselect={({ selectedKeys }) =>
          handleCategoryChange(selectedKeys as string[])
        }
        className="border-0"
        style={{ background: "transparent" }}
        items={[
          {
            key: "category-group",
            label: (
              <span
                data-cy="filter-category-group"
                className="font-medium text-black!"
              >
                Categories
              </span>
            ),
            icon: <TagOutlined className="text-black!" />,
            children: categories.map((c) => ({
              key: c.id,
              label: (
                <span
                  data-cy={`filter-category-${c.id}`}
                  className="text-black"
                >
                  {c.label}
                </span>
              ),
              icon: <span className="text-lg">{c.icon}</span>,
              "data-cy": `filter-category-${c.id}`,
            })),
          },
        ]}
      />

      <Collapse
        ghost
        expandIconPosition="end"
        items={[
          {
            key: "price-group",
            label: (
              <span
                data-cy="filter-price-group"
                className="font-medium text-black"
              >
                <DollarOutlined className="mr-2" />
                Price Range
              </span>
            ),
            children: (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="min-w-[50px] text-sm text-gray-600">
                    Min $
                  </span>
                  <Input
                    data-cy="filter-min-price"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="min-w-[50px] text-sm text-gray-600">
                    Max $
                  </span>
                  <Input
                    data-cy="filter-max-price"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    placeholder="9999"
                    inputMode="numeric"
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
