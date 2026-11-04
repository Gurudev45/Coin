import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../services/services';
import type { Customer } from '../types';
import CustomerForm from '../components/CustomerForm';
import { ArrowLeft, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    customerService.getById(id)
      .then(res => setCustomer(res.data))
      .catch(() => { toast.error('Customer not found'); navigate('/customers'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/customers/${id}`)} className="btn-secondary px-3 py-2">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Pencil size={20} className="text-indigo-400" />
            Edit ID
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 font-mono">{customer.idName}</p>
        </div>
      </div>

      <div className="card">
        <CustomerForm
          customer={customer}
          isEdit
          onSuccess={() => navigate(`/customers/${id}`)}
        />
      </div>
    </div>
  );
}
