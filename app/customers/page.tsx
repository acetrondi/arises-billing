"use client";

import { Button } from "@/components/ui/button";
import { AddCustomerSheet } from "@/components/add-customer-sheet";
import { db, Customer } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

export default function CustomersPage() {
  const customers = useLiveQuery(() => db.customers.toArray());
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(
    undefined
  );

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpen(true);
  };

  const handleSave = () => {
    setOpen(false);
    setSelectedCustomer(undefined);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customers</h1>
        <AddCustomerSheet
          trigger={<Button>Add Customer</Button>}
          customer={selectedCustomer}
          onSave={handleSave}
          open={open}
          onOpenChange={setOpen}
        />
      </div>
      <div className="border rounded-md">
        <div className="grid grid-cols-4 font-bold p-2 border-b">
          <div>Name</div>
          <div>Phone</div>
          <div>GSTIN</div>
          <div>Actions</div>
        </div>
        {customers?.map((customer) => (
          <div key={customer.id} className="grid grid-cols-4 p-2">
            <div>{customer.name}</div>
            <div>{customer.phone}</div>
            <div>{customer.gstin}</div>
            <div>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={() => db.customers.delete(customer.id!)}
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
