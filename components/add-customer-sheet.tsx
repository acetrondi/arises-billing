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
import { db, Customer } from "@/lib/db";
import { useState, useEffect } from "react";

interface AddCustomerSheetProps {
    trigger?: React.ReactNode;
    customer?: Customer;
    onSave?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddCustomerSheet({
    trigger,
    customer,
    onSave,
    open,
    onOpenChange,
}: AddCustomerSheetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [gstin, setGstin] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    // Use controlled open state if provided, otherwise use internal state
    const isControlled = open !== undefined;
    const sheetOpen = isControlled ? open : isOpen;
    const setSheetOpen = isControlled ? onOpenChange! : setIsOpen;

    useEffect(() => {
        if (customer) {
            setName(customer.name);
            setPhone(customer.phone);
            setEmail(customer.email);
            setGstin(customer.gstin);
            setCompanyName(customer.companyName);
            setBillingAddress(customer.billingAddress);
            setShippingAddress(customer.shippingAddress);
        } else {
            // Reset form when no customer (adding new)
            setName("");
            setPhone("");
            setEmail("");
            setGstin("");
            setCompanyName("");
            setBillingAddress("");
            setShippingAddress("");
        }
    }, [customer, sheetOpen]);

    const handleSubmit = async () => {
        const newCustomer: Customer = {
            name,
            phone,
            email,
            gstin,
            companyName,
            billingAddress,
            shippingAddress,
        };
        if (customer) {
            await db.customers.update(customer.id!, newCustomer);
        } else {
            await db.customers.add(newCustomer);
        }
        setSheetOpen(false);
        if (onSave) {
            onSave();
        }
    };

    const content = (
        <SheetContent className="overflow-y-auto">
            <SheetHeader>
                <SheetTitle>
                    {customer ? "Edit Customer" : "Add Customer"}
                </SheetTitle>
                <SheetDescription>
                    {customer
                        ? "Edit the customer details."
                        : "Add a new customer to your list."}
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
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                        id="gstin"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="billingAddress">Billing Address</Label>
                    <Textarea
                        id="billingAddress"
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                    />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="shippingAddress">Shipping Address</Label>
                    <Textarea
                        id="shippingAddress"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
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
