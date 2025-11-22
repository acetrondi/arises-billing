import Dexie, { Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  sellingPrice: number;
  tax: number;
  hsn: string;
  purchasePrice: number;
  barcode: string;
  category: string;
  image: string;
  description: string;
  quantity: number;
}

export interface Customer {
  id?: number;
  name: string;
  phone: string;
  email: string;
  gstin: string;
  companyName: string;
  billingAddress: string;
  shippingAddress: string;
}

export interface Sale {
  id?: number;
  customer: Customer;
  invoiceDate: Date;
  dueDate: Date;
  products: Product[];
  total: number;
}

export class MySubClassedDexie extends Dexie {
  products!: Table<Product>;
  customers!: Table<Customer>;
  sales!: Table<Sale>;

  constructor() {
    super('billingDB');
    this.version(1).stores({
      products: '++id, name, category',
      customers: '++id, name, gstin',
      sales: '++id, invoiceDate'
    });
  }
}

export const db = new MySubClassedDexie();
