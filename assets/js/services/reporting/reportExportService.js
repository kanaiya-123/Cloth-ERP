// CLOTHERP - Centralized Report Export & Printing Service
export class ReportExportService {
    /**
     * Export Array of Objects to CSV File and Trigger Browser Download
     */
    static exportToCsv(filename, headers, rows) {
        if (!rows || rows.length === 0) {
            console.warn('[ReportExportService] No rows to export.');
            return false;
        }

        const escapeCell = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const csvContent = [];
        // 1. Header row
        csvContent.push(headers.map(h => escapeCell(h.label || h)).join(','));

        // 2. Data rows
        rows.forEach(row => {
            const rowValues = headers.map(h => {
                const key = h.key || h;
                const cellVal = row[key] !== undefined ? row[key] : '';
                return escapeCell(cellVal);
            });
            csvContent.push(rowValues.join(','));
        });

        const blob = new Blob([csvContent.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return true;
    }

    /**
     * Print Current Report Layout
     */
    static triggerPrint() {
        window.print();
    }
}
