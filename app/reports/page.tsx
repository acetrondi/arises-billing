"use client";

import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

export default function ReportsPage() {
  const sales = useLiveQuery(() => db.sales.toArray());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="border rounded-md">
        <div className="grid grid-cols-4 font-bold p-2 border-b">
          <div>Invoice Date</div>
          <div>Customer</div>
          <div>Due Date</div>
          <div>Total</div>
        </div>
        {sales?.map((sale) => (
          <div key={sale.id} className="grid grid-cols-4 p-2">
            <div>{new Date(sale.invoiceDate).toLocaleDateString()}</div>
            <div>{sale.customer.name}</div>
            <div>{new Date(sale.dueDate).toLocaleDateString()}</div>
            <div>{sale.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
