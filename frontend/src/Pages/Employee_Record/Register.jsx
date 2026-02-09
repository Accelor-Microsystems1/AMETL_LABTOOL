import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../components/authentication/authContext';
import { toast } from 'sonner';

function Register({onRegisterSuccess}) {
  const [form, setForm] = useState({name:'', email: '', password: '', role:'JUNIORENGINEER'});
  const [loading, setLoading] = useState(false);
  const user = useAuth();

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = user.role;
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, form, {
        header: {
          Authorization: `Bearer ${token}`,
        },
      });
      setForm({name: '', email:'', password:'', role: 'JUNIORENGINEER'});
      if (onRegisterSuccess) onRegisterSuccess();
      toast.success('User Registered successfully !');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className='w-full max-w-md'>
      <h2 className='text-xl font-semibold mb-4 text-gray-800'>
        Register New Employee
      </h2>
      <form onSubmit={handleRegister} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
           <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 appearance-none"
          >
            <option value="JUNIORENGINEER">Junior Engineer</option>
            <option value="TESTENGINEER">Test Engineer</option>
            <option value="ADMIN">Admin Manager</option>
            <option value="MANAGER">Technical Manager</option>
            <option value="HOD">HOD</option>
            <option value="CUSTOMER">Customer</option>
            <option value="CEO">CEO</option>
          </select>
        </div>
          <button 
          type='submit'
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
