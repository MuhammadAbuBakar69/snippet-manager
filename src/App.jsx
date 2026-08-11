import React, { useState, useEffect } from 'react';
import './snippet-manager_App.css';

const DEFAULT_SNIPPETS = [
  {
    id: 's1',
    title: 'Debounce Utility Function',
    language: 'JavaScript',
    description: 'Delays function execution until after wait milliseconds have elapsed.',
    code: `function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`
  },
  {
    id: 's2',
    title: 'CSS Glassmorphism Container',
    language: 'CSS',
    description: 'Modern translucent frosted glass visual style using backdrop-filter.',
    code: `.glass-container {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 1rem;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`
  },
  {
    id: 's3',
    title: 'Python Fast Async Fetcher',
    language: 'Python',
    description: 'Asynchronous HTTP requests using aiohttp and asyncio.',
    code: `import aiohttp
import asyncio

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        return await asyncio.gather(*tasks)`
  },
  {
    id: 's4',
    title: 'SQL Top Customers Query',
    language: 'SQL',
    description: 'Aggregate revenue per customer with join and order limit.',
    code: `SELECT 
    c.customer_id,
    c.first_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name
ORDER BY total_spent DESC
LIMIT 10;`
  }
];

const LANGUAGES = ['All', 'JavaScript', 'TypeScript', 'Python', 'CSS', 'HTML', 'SQL', 'Bash'];

export default function App() {
  const [snippets, setSnippets] = useState(() => {
    try {
      const saved = localStorage.getItem('snippet_manager_snippets');
      return saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
    } catch (e) {
      return DEFAULT_SNIPPETS;
    }
  });

  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSnippetId, setActiveSnippetId] = useState(snippets[0]?.id || null);
  const [copiedId, setCopiedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New snippet form state
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('JavaScript');
  const [newDescription, setNewDescription] = useState('');
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('snippet_manager_snippets', JSON.stringify(snippets));
    } catch (e) {
      console.error(e);
    }
  }, [snippets]);

  const filteredSnippets = snippets.filter(s => {
    const matchesLang = selectedLanguage === 'All' || s.language === selectedLanguage;
    const matchesQuery = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesQuery;
  });

  const activeSnippet = snippets.find(s => s.id === activeSnippetId) || filteredSnippets[0];

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this code snippet?')) {
      const remaining = snippets.filter(s => s.id !== id);
      setSnippets(remaining);
      if (activeSnippetId === id) {
        setActiveSnippetId(remaining[0]?.id || null);
      }
    }
  };

  const handleAddSnippet = (e) => {
    e.preventDefault();
    if (!newTitle || !newCode) return;

    const created = {
      id: Date.now().toString(),
      title: newTitle,
      language: newLanguage,
      description: newDescription,
      code: newCode,
    };

    setSnippets([created, ...snippets]);
    setActiveSnippetId(created.id);
    setIsModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewCode('');
  };

  return (
    <div className="sm-ide-app">
      {/* IDE Top Bar */}
      <header className="sm-topbar">
        <div className="sm-brand">
          <span className="sm-brand-icon">⚡</span>
          <span className="sm-brand-name">DevSnippet Vault</span>
        </div>
        <div className="sm-topbar-controls">
          <input
            type="text"
            placeholder="🔍 Search snippets..."
            className="sm-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="sm-btn-add" onClick={() => setIsModalOpen(true)}>+ New Snippet</button>
        </div>
      </header>

      {/* Main IDE Body */}
      <div className="sm-ide-body">
        {/* Left Sidebar: Snippet Directory */}
        <aside className="sm-sidebar">
          <div className="sm-sidebar-filter">
            <label>Filter by Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="sm-select"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="sm-snippet-list">
            {filteredSnippets.length > 0 ? (
              filteredSnippets.map(snip => (
                <div
                  key={snip.id}
                  className={`sm-snippet-item ${activeSnippet?.id === snip.id ? 'active' : ''}`}
                  onClick={() => setActiveSnippetId(snip.id)}
                >
                  <div className="sm-snip-item-header">
                    <span className="sm-snip-title">{snip.title}</span>
                    <span className={`sm-lang-badge ${snip.language.toLowerCase()}`}>{snip.language}</span>
                  </div>
                  <p className="sm-snip-desc">{snip.description || 'No description provided.'}</p>
                </div>
              ))
            ) : (
              <p className="sm-empty">No code snippets found.</p>
            )}
          </div>
        </aside>

        {/* Right Pane: Code Viewer */}
        <main className="sm-code-pane">
          {activeSnippet ? (
            <div className="sm-viewer">
              <div className="sm-viewer-header">
                <div>
                  <h2>{activeSnippet.title}</h2>
                  <span className={`sm-lang-badge ${activeSnippet.language.toLowerCase()}`}>
                    {activeSnippet.language}
                  </span>
                </div>
                <div className="sm-viewer-actions">
                  <button
                    className={`sm-btn-copy ${copiedId === activeSnippet.id ? 'copied' : ''}`}
                    onClick={() => handleCopy(activeSnippet.code, activeSnippet.id)}
                  >
                    {copiedId === activeSnippet.id ? '✓ Copied!' : '📋 Copy Code'}
                  </button>
                  <button className="sm-btn-delete" onClick={() => handleDelete(activeSnippet.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {activeSnippet.description && (
                <p className="sm-viewer-desc">{activeSnippet.description}</p>
              )}

              <div className="sm-editor-window">
                <div className="sm-editor-titlebar">
                  <span className="sm-dot red"></span>
                  <span className="sm-dot yellow"></span>
                  <span className="sm-dot green"></span>
                  <span className="sm-filename">{activeSnippet.title.toLowerCase().replace(/\s+/g, '_')}.{activeSnippet.language.toLowerCase()}</span>
                </div>
                <div className="sm-code-wrapper">
                  <pre className="sm-pre">
                    <code className="sm-code">{activeSnippet.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="sm-no-selection">
              <p>Select a snippet from the list or create a new one.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modal for Adding Snippet */}
      {isModalOpen && (
        <div className="sm-modal-overlay">
          <div className="sm-modal">
            <div className="sm-modal-header">
              <h3>Add New Code Snippet</h3>
              <button className="sm-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSnippet} className="sm-modal-form">
              <div className="sm-form-group">
                <label>Snippet Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Array Chunking Utility"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="sm-modal-input"
                />
              </div>

              <div className="sm-form-group">
                <label>Language *</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="sm-modal-input"
                >
                  {LANGUAGES.filter(l => l !== 'All').map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="sm-form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Short summary of what this code does..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="sm-modal-input"
                />
              </div>

              <div className="sm-form-group">
                <label>Code *</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste or write code here..."
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="sm-modal-textarea"
                />
              </div>

              <div className="sm-modal-actions">
                <button type="submit" className="sm-btn-save">Save Snippet</button>
                <button type="button" className="sm-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
