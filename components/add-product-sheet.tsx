"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { db, Product } from "@/lib/db";
import { useState, useEffect } from "react";

interface AddProductSheetProps {
    trigger?: React.ReactNode;
    product?: Product;
    onSave?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddProductSheet({
    trigger,
    product,
    onSave,
    open,
    onOpenChange,
}: AddProductSheetProps) {
    const [isOpen, setIsOpen] = useState(false);
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

    // Use controlled open state if provided, otherwise use internal state
    const isControlled = open !== undefined;
    const sheetOpen = isControlled ? open : isOpen;
    const setSheetOpen = isControlled ? onOpenChange! : setIsOpen;

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
        } else {
            // Reset form when no product (adding new)
            setName("");
            setSellingPrice(0);
            setTax(0);
            setHsn("");
            setPurchasePrice(0);
            setBarcode("");
            setCategory("");
            setImage("");
            setDescription("");
            setQuantity(0);
        }
    }, [product, sheetOpen]);

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
        setSheetOpen(false);
        if (onSave) {
            onSave();
        }
    };

    const content = (
        <SheetContent className="overflow-y-auto">
            <SheetHeader>
                <SheetTitle>{product ? "Edit Product" : "Add Product"}</SheetTitle>
                <SheetDescription>
                    {product
                        ? "Edit the product details."
                        : "Add a new product to your inventory."}
                </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-6 px-4 py-4">
                <div className="grid gap-3">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="sellingPrice">Selling Price</Label>
                    <Input
                        id="sellingPrice"
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                        id="tax"
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value))}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="hsn">HSN/SAC</Label>
                    <Input
                        id="hsn"
                        value={hsn}
                        onChange={(e) => setHsn(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                        id="purchasePrice"
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                        id="barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                        id="image"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
            <SheetFooter>
                <Button onClick={handleSubmit}>Save</Button>
            </SheetFooter>
        </SheetContent>
    );

    if (trigger) {
        return (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>{trigger}</SheetTrigger>
                {content}
            </Sheet>
        );
    }

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            {content}
        </Sheet>
    );
}
