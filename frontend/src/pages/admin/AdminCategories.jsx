import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { categoriesAPI } from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', icon: '', color: '#6366f1', sort_order: 0 });

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesAPI.adminGetAll();
      setCategories(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', icon: '', color: '#6366f1', sort_order: 0 });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (cat) => {
    setForm({
      name: cat.name, description: cat.description || '',
      icon: cat.icon || '', color: cat.color || '#6366f1',
      sort_order: cat.sort_order || 0,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await categoriesAPI.update(editingId, form);
      } else {
        await categoriesAPI.create(form);
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await categoriesAPI.delete(id);
      fetchCategories();
    } catch (err) { 
      console.error('Failed to delete:', err); 
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Manage Categories</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{categories.length} categories</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="dashboard-section" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{editingId ? 'Edit Category' : 'New Category'}</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}><FiX /></button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (emoji)</label>
              <input className="form-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g., ✍️" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description" />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ width: '40px', height: '36px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                <input className="form-input" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input className="form-input" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary"><FiSave /> {editingId ? 'Update' : 'Create'} Category</button>
        </form>
      )}

      <div className="dashboard-section">
        <div className="dashboard-table">
          {loading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Prompts</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontSize: '20px' }}>{cat.icon}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }}></div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description || '—'}</td>
                    <td>{cat.prompt_count || 0}</td>
                    <td>{cat.sort_order}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => startEdit(cat)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(cat.id, cat.name)} title="Delete" style={{ color: 'var(--color-error)' }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>No categories yet</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
