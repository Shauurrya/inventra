export const chartTheme = {
    background: 'transparent',
    textColor: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    grid: { stroke: '#1f2937', strokeDasharray: '3 3' },
    tooltip: {
        contentStyle: {
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        },
        itemStyle: { color: '#f1f5f9' },
        labelStyle: { color: '#94a3b8', fontWeight: 600, marginBottom: 4 },
    },
    colors: ['#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'],
    axis: {
        stroke: '#1f2937',
        tick: { fill: '#64748b', fontSize: 10 },
    },
};
