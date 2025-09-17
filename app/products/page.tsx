'use client';
import { useState, useEffect } from 'react';
// Define the type for a Product object
interface Product {
  id: number;
  name: string;
  price: number;
  price1: number;
  price2: number;
  price3: number;
}
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // Fetch products when the component mounts
  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Products</h1>
      {/* Products Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Product List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price 1</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price 2</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price 3</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{products.map((product) => (<tr key={product.id}><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td><td className="px-6 py-4 whitespace-nowrap">{product.price}</td><td className="px-6 py-4 whitespace-nowrap">{product.price1}</td><td className="px-6 py-4 whitespace-nowrap">{product.price2}</td><td className="px-6 py-4 whitespace-nowrap">{product.price3}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
