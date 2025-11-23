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
import { AddCustomerSheet } from "@/components/add-customer-sheet";
import { AddProductSheet } from "@/components/add-product-sheet";
import { db, Product, Customer, Sale } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusIcon, Package, User, FileText, Landmark } from "lucide-react";

export default function SaleFormPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const products = useLiveQuery(() => db.products.toArray());
  const customers = useLiveQuery(() => db.customers.toArray());

  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [reference, setReference] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV");
  const [invoiceNo, setInvoiceNo] = useState("001");
  const [invoiceSuffix, setInvoiceSuffix] = useState("25-26");
  const [lineItems, setLineItems] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [branch, setBranch] = useState("");
  const [total, setTotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [roundOff, setRoundOff] = useState(0);

  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  const [productSheetOpen, setProductSheetOpen] = useState(false);

  useEffect(() => {
    if (id !== "new") {
      db.sales.get(Number(id)).then((sale) => {
        if (sale) {
          setCustomer(sale.customer);
          setInvoiceDate(sale.invoiceDate);
          setDueDate(sale.dueDate);
          setLineItems(sale.products);
          setTotal(sale.total);
          // Set invoice number from ID
          setInvoiceNo(String(id).padStart(3, "0"));
        }
      });
    } else {
      // Generate a default invoice number for new invoices
      const timestamp = String(Date.now()).slice(-3);
      setInvoiceNo(timestamp);
    }
  }, [id]);

  useEffect(() => {
    const subtotal = lineItems.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    const tax = lineItems.reduce(
      (acc, item) => acc + (item.sellingPrice * item.quantity * item.tax) / 100,
      0
    );
    setTaxTotal(tax);
    setTotal(subtotal + tax + roundOff);
  }, [lineItems, roundOff]);

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

  const removeProduct = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = async (draft = false) => {
    if (!customer) {
      alert("Please select a customer");
      return;
    }

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

  const taxableAmount = lineItems.reduce(
    (acc, item) => acc + item.sellingPrice * item.quantity,
    0
  );

  return (
    <div className="max-w-7xl mx-auto pb-48">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {id === "new" ? "Create Invoice" : "Edit Invoice"}
          </h1>
          <p className="text-muted-foreground mt-1">Invoice Packing Slips</p>
        </div>
        <div className="text-right">
          <Label className="text-sm text-muted-foreground mb-2 block">Invoice Number</Label>
          <div className="flex items-center gap-1">
            <Input
              className="text-lg font-semibold text-right w-16"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              placeholder="INV"
            />
            <span className="text-lg font-semibold">-</span>
            <Input
              className="text-lg font-semibold text-center w-16"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="001"
            />
            <span className="text-lg font-semibold">-</span>
            <Input
              className="text-lg font-semibold text-left w-20"
              value={invoiceSuffix}
              onChange={(e) => setInvoiceSuffix(e.target.value)}
              placeholder="25-26"
            />
          </div>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
        {/* Customer Details & Other Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Details */}
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Customer details</h2>
            </div>
            <div className="space-y-3">
              <Select
                onValueChange={(value) =>
                  setCustomer(customers?.find((c) => c.id === Number(value)))
                }
                value={customer?.id?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your Customer, Company Name, GSTIN, Tags..." />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c) => (
                    <SelectItem key={c.id} value={c.id!.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setCustomerSheetOpen(true)}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <PlusIcon className="h-3 w-3" />
                Add new Customer?
              </button>
            </div>
          </div>

          {/* Other Details */}
          <div className="border rounded-lg p-6 bg-card">
            <h2 className="text-lg font-semibold mb-4">Other Details</h2>
            <div className="space-y-3">
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
              <div>
                <Label>Reference</Label>
                <Input
                  placeholder="e.g. PO Number, Sales Person names, Withhold Retailer info..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products & Services */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Products & Services</h2>
            </div>
            <AddProductSheet
              trigger={
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add New Product
                </Button>
              }
              open={productSheetOpen}
              onOpenChange={setProductSheetOpen}
              onSave={() => setProductSheetOpen(false)}
            />
          </div>

          {/* Products Table */}
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="text-sm">
                    <th className="text-left p-3 font-medium">Product Name</th>
                    <th className="text-right p-3 font-medium">Quantity</th>
                    <th className="text-right p-3 font-medium">Unit Price</th>
                    <th className="text-right p-3 font-medium">Tax %</th>
                    <th className="text-right p-3 font-medium">Price with Tax</th>
                    <th className="text-right p-3 font-medium">Total Amount</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Search existing products to add to this list or add new product to get started</p>
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, index) => {
                      const priceWithTax = item.sellingPrice + (item.sellingPrice * item.tax) / 100;
                      const totalAmount = priceWithTax * item.quantity;
                      return (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-right">
                            <Input
                              type="number"
                              className="w-20 text-right"
                              value={item.quantity}
                              onChange={(e) => {
                                const newLineItems = [...lineItems];
                                newLineItems[index].quantity = Number(e.target.value);
                                setLineItems(newLineItems);
                              }}
                            />
                          </td>
                          <td className="p-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">{item.tax}%</td>
                          <td className="p-3 text-right">₹{priceWithTax.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">₹{totalAmount.toFixed(2)}</td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => removeProduct(index)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="mt-4">
            <Select onValueChange={(value) => addProduct(products?.find(p => p.id === Number(value))!)}>
              <SelectTrigger>
                <SelectValue placeholder="Search or scan barcode for existing products" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((p) => (
                  <SelectItem key={p.id} value={p.id!.toString()}>
                    {p.name} - ₹{p.sellingPrice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notes Section */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notes, terms & more...</h2>
          </div>
          <Textarea
            placeholder="Enter your notes, terms, or anything else..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Bank Details Section */}
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Bank Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input
                placeholder="Enter IFSC code"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
              />
            </div>
            <div>
              <Label>Account Number</Label>
              <Input
                placeholder="Enter account number"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
              />
            </div>
            <div>
              <Label>Branch</Label>
              <Input
                placeholder="Enter branch name"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Summary Details */}
            <div className="flex items-center gap-8 text-sm">
              <div>
                <span className="text-muted-foreground">Items: </span>
                <span className="font-medium">{lineItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Taxable: </span>
                <span className="font-medium">₹{taxableAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tax: </span>
                <span className="font-medium">₹{taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Round Off: </span>
                <Input
                  type="number"
                  className="w-20 h-8 text-right"
                  value={roundOff}
                  onChange={(e) => setRoundOff(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold">₹{total.toFixed(2)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button onClick={() => handleSave(true)} variant="outline">
                  Save as Draft
                </Button>
                <Button onClick={() => handleSave(false)} variant="outline">
                  Save and Print
                </Button>
                <Button onClick={() => handleSave(false)} size="lg" className="px-8">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden sheets */}
      <AddCustomerSheet
        open={customerSheetOpen}
        onOpenChange={setCustomerSheetOpen}
        onSave={() => setCustomerSheetOpen(false)}
      />
    </div>
  );
}
