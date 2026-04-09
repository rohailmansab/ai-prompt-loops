import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { blogAPI } from '../../services/api';

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await blogAPI.adminGetAll({ page: p, limit: 15 });
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(page); }, [page]);

  const handleDelete = async (id, title) => {
    try {
      await blogAPI.delete(id);
      fetchPosts(page);
    } catch (err) { 
      console.error('Failed to delete:', err); 
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Manage Blog Posts</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{pagination.total || 0} total posts</p>
        </div>
        <Link to="/admin/blog/new" className="btn btn-primary btn-sm"><FiPlus /> New Post</Link>
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
                  <th>Status</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td>{p.category || '—'}</td>
                    <td><span className={`badge badge-${p.status === 'published' ? 'success' : p.status === 'draft' ? 'warning' : 'error'}`}>{p.status}</span></td>
                    <td>{p.views}</td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {p.status === 'published' && <Link to={`/blog/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm" title="View"><FiEye /></Link>}
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/blog/${p.id}`, { state: { post: p } })} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id, p.title)} title="Delete" style={{ color: 'var(--color-error)' }}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>No blog posts yet</td></tr>
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

export default AdminBlog;
