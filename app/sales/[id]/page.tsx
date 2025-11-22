"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db, Product, Customer, Sale } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SaleFormPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const products = useLiveQuery(() => db.products.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [lineItems, setLineItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (id !== "new") {
      db.sales.get(Number(id)).then((sale) => {
        if (sale) {
          setCustomer(sale.customer);
          setInvoiceDate(sale.invoiceDate);
          setDueDate(sale.dueDate);
          setLineItems(sale.products);
          setTotal(sale.total);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    const newTotal = lineItems.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    setTotal(newTotal);
  }, [lineItems]);

  const addProduct = (product: Product) => {
    const existingItem = lineItems.find((item) => item.id === product.id);
    if (existingItem) {
      const newLineItems = lineItems.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setLineItems(newLineItems);
    } else {
      setLineItems([...lineItems, { ...product, quantity: 1 }]);
    }
  };

  const handleSave = async () => {
    if (!customer) return;

    const sale: Sale = {
      customer,
      invoiceDate,
      dueDate,
      products: lineItems,
      total,
    };

    if (id === "new") {
      await db.sales.add(sale);
      // Update inventory for new sale
      for (const item of lineItems) {
        const product = await db.products.get(item.id!);
        if (product) {
          await db.products.update(item.id!, {
            quantity: product.quantity - item.quantity,
          });
        }
      }
    } else {
      const originalSale = await db.sales.get(Number(id));
      if (originalSale) {
        // Restore original inventory
        for (const item of originalSale.products) {
          const product = await db.products.get(item.id!);
          if (product) {
            await db.products.update(item.id!, {
              quantity: product.quantity + item.quantity,
            });
          }
        }
      }

      await db.sales.update(Number(id), sale);

      // Update inventory for edited sale
      for (const item of lineItems) {
        const product = await db.products.get(item.id!);
        if (product) {
          await db.products.update(item.id!, {
            quantity: product.quantity - item.quantity,
          });
        }
      }
    }

    router.push("/sales");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {id === "new" ? "New Sale" : "Edit Sale"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer</Label>
          <Select
            onValueChange={(value) =>
              setCustomer(customers?.find((c) => c.id === Number(value)))
            }
            value={customer?.id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((c) => (
                <SelectItem key={c.id} value={c.id!.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input
            type="date"
            value={invoiceDate.toISOString().split("T")[0]}
            onChange={(e) => setInvoiceDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={dueDate.toISOString().split("T")[0]}
            onChange={(e) => setDueDate(new Date(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold">Products</h2>
        <div className="border rounded-md mt-2">
          <div className="grid grid-cols-4 font-bold p-2 border-b">
            <div>Product</div>
            <div>Quantity</div>
            <div>Price</div>
            <div>Total</div>
          </div>
          {lineItems.map((item, index) => (
            <div key={index} className="grid grid-cols-4 p-2">
              <div>{item.name}</div>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const newLineItems = [...lineItems];
                  newLineItems[index].quantity = Number(e.target.value);
                  setLineItems(newLineItems);
                }}
              />
              <div>{item.sellingPrice}</div>
              <div>{item.sellingPrice * item.quantity}</div>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Select onValueChange={(value) => addProduct(products?.find(p => p.id === Number(value))!)}>
            <SelectTrigger>
              <SelectValue placeholder="Add a product" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((p) => (
                <SelectItem key={p.id} value={p.id!.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
