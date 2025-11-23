"use client";

import { Button } from "@/components/ui/button";
import { AddProductSheet } from "@/components/add-product-sheet";
import { db, Product } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

export default function ProductsPage() {
  const products = useLiveQuery(() => db.products.toArray());
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleSave = () => {
    setOpen(false);
    setSelectedProduct(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <AddProductSheet
          trigger={<Button>Add Product</Button>}
          product={selectedProduct}
          onSave={handleSave}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
      <div className="border rounded-md">
        <div className="grid grid-cols-4 font-bold p-2 border-b">
          <div>Name</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Actions</div>
        </div>
        {products?.map((product) => (
          <div key={product.id} className="grid grid-cols-4 p-2">
            <div>{product.name}</div>
            <div>{product.sellingPrice}</div>
            <div>{product.quantity}</div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => db.products.delete(product.id!)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
