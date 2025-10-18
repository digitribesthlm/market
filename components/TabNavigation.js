export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'market', label: 'Market & Alerts' },
    { id: 'holdings', label: 'Holdings' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '0',
      marginBottom: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1,
            padding: '14px 20px',
            border: 'none',
            background: activeTab === tab.id ? '#3b82f6' : '#f8fafc',
            color: activeTab === tab.id ? '#fff' : '#64748b',
            fontSize: '14px',
            fontWeight: activeTab === tab.id ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.background = '#f1f5f9';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.background = '#f8fafc';
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
