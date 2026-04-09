import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { promptsAPI } from '../../services/api';

const AdminPrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchPrompts = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await promptsAPI.adminGetAll({ page: p, limit: 15 });
      setPrompts(data.data);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPrompts(page); }, [page]);

  const handleDelete = async (id, title) => {
    try {
      await promptsAPI.delete(id);
      fetchPrompts(page);
    } catch (err) { 
      console.error('Failed to delete:', err); 
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Manage Prompts</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{pagination.total || 0} total prompts</p>
        </div>
        <Link to="/admin/prompts/new" className="btn btn-primary btn-sm"><FiPlus /> New Prompt</Link>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-table">
          {loading ? (
            <div className="loading-container" style={{ minHeight: '200px' }}><div className="spinner"></div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td>{p.category_name || '—'}</td>
                    <td><span className={`badge badge-${p.difficulty === 'beginner' ? 'success' : p.difficulty === 'advanced' ? 'error' : 'warning'}`}>{p.difficulty}</span></td>
                    <td>{p.views}</td>
                    <td><span className={`badge ${p.is_published ? 'badge-success' : 'badge-warning'}`}>{p.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Link to={`/prompts/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm" title="View"><FiEye /></Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/prompts/${p.id}`, { state: { prompt: p } })} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id, p.title)} title="Delete" style={{ color: 'var(--color-error)' }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {prompts.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>No prompts found. Create your first prompt!</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ padding: 'var(--space-4)' }}>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}><FiChevronLeft /> Prev</button>
            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next <FiChevronRight /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPrompts;
