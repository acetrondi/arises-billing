"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db, Product } from "@/lib/db";
import { useState, useEffect } from "react";

interface ProductFormProps {
  product?: Product;
  onSave: () => void;
}

export function ProductForm({ product, onSave }: ProductFormProps) {
  const [name, setName] = useState("");
  const [sellingPrice, setSellingPrice] = useState(0);
  const [tax, setTax] = useState(0);
  const [hsn, setHsn] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSellingPrice(product.sellingPrice);
      setTax(product.tax);
      setHsn(product.hsn);
      setPurchasePrice(product.purchasePrice);
      setBarcode(product.barcode);
      setCategory(product.category);
      setImage(product.image);
      setDescription(product.description);
      setQuantity(product.quantity);
    }
  }, [product]);

  const handleSubmit = async () => {
    const newProduct: Product = {
      name,
      sellingPrice,
      tax,
      hsn,
      purchasePrice,
      barcode,
      category,
      image,
      description,
      quantity,
    };
    if (product) {
      await db.products.update(product.id!, newProduct);
    } else {
      await db.products.add(newProduct);
    }
    onSave();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Edit the product details."
            : "Add a new product to your inventory."}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sellingPrice" className="text-right">
            Selling Price
          </Label>
          <Input
            id="sellingPrice"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tax" className="text-right">
            Tax (%)
          </Label>
          <Input
            id="tax"
            type="number"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value))}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="hsn" className="text-right">
            HSN/SAC
          </Label>
          <Input
            id="hsn"
            value={hsn}
            onChange={(e) => setHsn(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="purchasePrice" className="text-right">
            Purchase Price
          </Label>
          <Input
            id="purchasePrice"
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value))}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="barcode" className="text-right">
            Barcode
          </Label>
          <Input
            id="barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="image" className="text-right">
            Image URL
          </Label>
          <Input
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
}
