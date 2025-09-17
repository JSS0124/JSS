'use client';
import { useState, useEffect, useMemo } from 'react';
// Define types for our data
interface Client { id: number; name: string; price_level: 'price' | 'price1' | 'price2' | 'price3'; }
interface Vendor { id: number; name: string; }
interface Product { id: number; name: string; price: number; price1: number; price2: number; price3: number; }
interface Delivery { id: number; delivery_date: string; slip_number: string; vehicle_number: string; client_name: string; product_name: string; calculated_sqft: number; rate: number; total_amount: number; }
export default function DeliveriesPage() {
  // State for form inputs and dropdown data
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Form state
  const [formState, setFormState] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    slip_number: '',
    vehicle_number: '',
    client_id: '',
    vendor_id: '',
    product_id: '',
    measurement_foot: 0,
    measurement_az: 0,
    measurement_size: 0,
  });
  // Fetch initial data for dropdowns and table
  useEffect(() => {
    async function fetchData() {
      const [clientsRes, vendorsRes, productsRes, deliveriesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/vendors'),
        fetch('/api/products'),
        fetch('/api/deliveries'),
      ]);
      setClients(await clientsRes.json());
      setVendors(await vendorsRes.json());
      setProducts(await productsRes.json());
      setDeliveries(await deliveriesRes.json());
    }
    fetchData();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };
  // Auto-calculation logic
  const calculatedValues = useMemo(() => {
    const { client_id, product_id, measurement_foot, measurement_az, measurement_size } = formState;
    const sqft = measurement_foot * measurement_az * measurement_size;
    const selectedClient = clients.find(c => c.id === parseInt(client_id));
    const selectedProduct = products.find(p => p.id === parseInt(product_id));
    let rate = 0;
    if (selectedClient && selectedProduct) {
      rate = selectedProduct[selectedClient.price_level] || 0;
    }
    const totalAmount = sqft * rate;
    return { sqft, rate, totalAmount };
  }, [formState, clients, products]);
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formState,
      client_id: parseInt(formState.client_id),
      vendor_id: parseInt(formState.vendor_id),
      product_id: parseInt(formState.product_id),
      calculated_sqft: calculatedValues.sqft,
      rate: calculatedValues.rate,
      total_amount: calculatedValues.totalAmount
    };
    const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (response.ok) {
        alert('Delivery added!');
        // Refresh deliveries list
        const deliveriesRes = await fetch('/api/deliveries');
        setDeliveries(await deliveriesRes.json());
    } else {
        alert('Failed to add delivery.');
    }
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Deliveries</h1>
      {/* Add Delivery Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Delivery</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label htmlFor="delivery_date">Date</label><input type="date" name="delivery_date" value={formState.delivery_date} onChange={handleInputChange} required /></div>
          <div><label htmlFor="slip_number">Slip #</label><input type="text" name="slip_number" value={formState.slip_number} onChange={handleInputChange} required /></div>
          <div><label htmlFor="vehicle_number">Vehicle #</label><input type="text" name="vehicle_number" value={formState.vehicle_number} onChange={handleInputChange} required /></div>
          <div><label htmlFor="client_id">Client</label><select name="client_id" value={formState.client_id} onChange={handleInputChange} required><option value="">Select Client</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label htmlFor="vendor_id">Vendor</label><select name="vendor_id" value={formState.vendor_id} onChange={handleInputChange} required><option value="">Select Vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
          <div><label htmlFor="product_id">Product</label><select name="product_id" value={formState.product_id} onChange={handleInputChange} required><option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label htmlFor="measurement_foot">Foot</label><input type="number" name="measurement_foot" value={formState.measurement_foot} onChange={handleInputChange} step="0.01" /></div>
          <div><label htmlFor="measurement_az">Az</label><input type="number" name="measurement_az" value={formState.measurement_az} onChange={handleInputChange} step="0.01" /></div>
          <div><label htmlFor="measurement_size">Size</label><input type="number" name="measurement_size" value={formState.measurement_size} onChange={handleInputChange} step="0.01" /></div>
          <div className="p-2 bg-gray-100 rounded"><label>Sqft</label><p className="font-mono">{calculatedValues.sqft.toFixed(2)}</p></div>
          <div className="p-2 bg-gray-100 rounded"><label>Rate</label><p className="font-mono">{calculatedValues.rate.toFixed(2)}</p></div>
          <div className="p-2 bg-indigo-100 rounded"><label>Total Amount</label><p className="font-mono font-bold text-indigo-800">{calculatedValues.totalAmount.toFixed(2)}</p></div>
          <div className="col-span-full"><button type="submit">Add Delivery</button></div>
        </form>
      </div>
      {/* Deliveries Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Recent Deliveries</h2>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slip #</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sqft</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th></tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{deliveries.map(d => (<tr key={d.id}><td className="px-6 py-4 whitespace-nowrap">{new Date(d.delivery_date).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap">{d.slip_number}</td><td className="px-6 py-4 whitespace-nowrap">{d.client_name}</td><td className="px-6 py-4 whitespace-nowrap">{d.product_name}</td><td className="px-6 py-4 whitespace-nowrap">{Number(d.calculated_sqft).toFixed(2)}</td><td className="px-6 py-4 whitespace-nowrap">{Number(d.rate).toFixed(2)}</td><td className="px-6 py-4 whitespace-nowrap font-bold">{Number(d.total_amount).toFixed(2)}</td></tr>))}</tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
