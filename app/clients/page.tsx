'use client';
import { useState, useEffect } from 'react';
// Define the type for a Client object
interface Client {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  address: string;
  type: 'Cash' | 'Credit';
  price_level: 'price' | 'price1' | 'price2' | 'price3';
}
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [formState, setFormState] = useState({
    name: '',
    contact_person: '',
    phone: '',
    address: '',
    type: 'Credit',
    price_level: 'price'
  });
  // Function to fetch clients from your API
  const fetchClients = async () => {
    const response = await fetch('/api/clients');
    const data = await response.json();
    setClients(data);
  };
  // Fetch clients when the component mounts
  useEffect(() => {
    fetchClients();
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formState),
    });
    if (response.ok) {
      alert('Client added successfully!');
      setFormState({ name: '', contact_person: '', phone: '', address: '', type: 'Credit', price_level: 'price' });
      fetchClients(); // Refresh the client list
    } else {
      alert('Failed to add client.');
    }
  };
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Clients</h1>
      {/* Add Client Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Client</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="name">Customer Name</label><input type="text" name="name" value={formState.name} onChange={handleInputChange} required /></div>
          <div><label htmlFor="contact_person">Contact Person</label><input type="text" name="contact_person" value={formState.contact_person} onChange={handleInputChange} /></div>
          <div><label htmlFor="phone">Phone</label><input type="text" name="phone" value={formState.phone} onChange={handleInputChange} /></div>
          <div><label htmlFor="address">Address</label><input type="text" name="address" value={formState.address} onChange={handleInputChange} /></div>
          <div><label htmlFor="type">Type</label><select name="type" value={formState.type} onChange={handleInputChange}><option value="Credit">Credit</option><option value="Cash">Cash</option></select></div>
          <div><label htmlFor="price_level">Price Level</label><select name="price_level" value={formState.price_level} onChange={handleInputChange}><option value="price">Price</option><option value="price1">Price1</option><option value="price2">Price2</option><option value="price3">Price3</option></select></div>
          <div className="col-span-full"><button type="submit">Add Client</button></div>
        </form>
      </div>
      {/* Clients Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Clients</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Level</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">{clients.map(client => (<tr key={client.id}><td className="px-6 py-4 whitespace-nowrap">{client.name}</td><td className="px-6 py-4 whitespace-nowrap">{client.phone}</td><td className="px-6 py-4 whitespace-nowrap">{client.type}</td><td className="px-6 py-4 whitespace-nowrap">{client.price_level}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
