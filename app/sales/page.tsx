"use client";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";

export default function SalesPage() {
  const sales = useLiveQuery(() => db.sales.toArray());

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Button asChild>
          <Link href="/sales/new">New Sale</Link>
        </Button>
      </div>
      <div className="border rounded-md">
        <div className="grid grid-cols-4 font-bold p-2 border-b">
          <div>Invoice Date</div>
          <div>Customer</div>
          <div>Due Date</div>
          <div>Total</div>
        </div>
        {sales?.map((sale) => (
          <Link
            href={`/sales/${sale.id}`}
            key={sale.id}
            className="grid grid-cols-4 p-2"
          >
            <div>{new Date(sale.invoiceDate).toLocaleDateString()}</div>
            <div>{sale.customer.name}</div>
            <div>{new Date(sale.dueDate).toLocaleDateString()}</div>
            <div>{sale.total}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
