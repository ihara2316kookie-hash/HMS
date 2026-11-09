import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import EmptyState from './EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching your criteria.',
  emptyAction,
  pageSize = 10,
  stickyHeader = true,
  className = '',
  style = {},
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.08))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      className={className}
    >
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--bg-muted, #F8FAFC)',
                borderBottom: '1px solid var(--border-color, #E2E8F0)',
                position: stickyHeader ? 'sticky' : 'static',
                top: 0,
                zIndex: 1,
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '12px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary, #4B5563)',
                    whiteSpace: 'nowrap',
                    width: col.width,
                    textAlign: col.align || 'left',
                    ...col.headerStyle,
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted, #6B7280)',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        border: '2px solid var(--color-primary-light, #E8F1FD)',
                        borderTopColor: 'var(--color-primary, #1E6FD9)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '24px 16px' }}>
                  <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => {
                const rowKey = row[keyField] ?? rIdx;
                return (
                  <tr
                    key={rowKey}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #EEF2F6)',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted, #F8FAFC)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || cIdx}
                        style={{
                          padding: '14px 16px',
                          color: 'var(--text-primary, #1F2937)',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle',
                          ...col.cellStyle,
                        }}
                      >
                        {col.render ? col.render(row, rIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && data.length > pageSize && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color, #E2E8F0)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--text-secondary, #4B5563)',
          }}
        >
          <div>
            Showing <strong>{startIndex + 1}</strong> to{' '}
            <strong>{Math.min(startIndex + pageSize, data.length)}</strong> of <strong>{data.length}</strong> results
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(1)}
              aria-label="First page"
              style={paginationBtnStyle(safePage === 1)}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              style={paginationBtnStyle(safePage === 1)}
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--text-primary, #1F2937)' }}>
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
              style={paginationBtnStyle(safePage === totalPages)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              aria-label="Last page"
              style={paginationBtnStyle(safePage === totalPages)}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function paginationBtnStyle(disabled) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid var(--border-color, #E2E8F0)',
    backgroundColor: '#FFFFFF',
    color: disabled ? 'var(--text-muted, #9CA3AF)' : 'var(--text-primary, #1F2937)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 150ms ease',
  };
}
