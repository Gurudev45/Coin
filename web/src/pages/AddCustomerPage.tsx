import { useNavigate } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function AddCustomerPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="btn-secondary px-3 py-2">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus size={22} className="text-indigo-400" />
            Add ID
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Create a new ID account</p>
        </div>
      </div>

      <div className="card">
        <CustomerForm onSuccess={() => navigate('/customers')} />
      </div>
    </div>
  );
}
