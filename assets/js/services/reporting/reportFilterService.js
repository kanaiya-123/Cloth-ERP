// CLOTHERP - Centralized Date Range & Report Filter Engine
export class ReportFilterService {
    /**
     * Get Normalized Start and End Date Boundaries for a Preset
     * Presets: 'today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'custom'
     */
    static getDateRangeBounds(preset, customStart = '', customEnd = '') {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        const d = now.getDate();

        let startDate = new Date(y, m, d);
        let endDate = new Date(y, m, d);

        switch (preset) {
            case 'today':
                startDate = new Date(y, m, d);
                endDate = new Date(y, m, d);
                break;
            
            case 'yesterday':
                startDate = new Date(y, m, d - 1);
                endDate = new Date(y, m, d - 1);
                break;

            case 'this_week': {
                const dayOfWeek = now.getDay(); // 0 = Sunday
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
                startDate = new Date(now.setDate(diff));
                endDate = new Date();
                break;
            }

            case 'last_week': {
                const dayOfWeek = now.getDay();
                const startDiff = now.getDate() - dayOfWeek - 6;
                const endDiff = startDiff + 6;
                startDate = new Date(y, m, startDiff);
                endDate = new Date(y, m, endDiff);
                break;
            }

            case 'this_month':
                startDate = new Date(y, m, 1);
                endDate = new Date(y, m + 1, 0);
                break;

            case 'last_month':
                startDate = new Date(y, m - 1, 1);
                endDate = new Date(y, m, 0);
                break;

            case 'this_quarter': {
                const qMonth = Math.floor(m / 3) * 3;
                startDate = new Date(y, qMonth, 1);
                endDate = new Date(y, qMonth + 3, 0);
                break;
            }

            case 'last_quarter': {
                const lastQMonth = Math.floor(m / 3) * 3 - 3;
                startDate = new Date(y, lastQMonth, 1);
                endDate = new Date(y, lastQMonth + 3, 0);
                break;
            }

            case 'this_year':
                startDate = new Date(y, 0, 1);
                endDate = new Date(y, 11, 31);
                break;

            case 'custom':
                if (customStart) startDate = new Date(customStart);
                if (customEnd) endDate = new Date(customEnd);
                break;

            default:
                // Default to this month
                startDate = new Date(y, m, 1);
                endDate = new Date(y, m + 1, 0);
        }

        return {
            startDate: this.formatDateIso(startDate),
            endDate: this.formatDateIso(endDate),
            startDateObj: startDate,
            endDateObj: endDate
        };
    }

    /**
     * Check if a given transaction date string (YYYY-MM-DD) falls within boundaries
     */
    static isDateInRange(itemDateStr, startIso, endIso) {
        if (!itemDateStr) return false;
        const target = itemDateStr.split('T')[0];
        return target >= startIso && target <= endIso;
    }

    static formatDateIso(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static formatDisplayDate(isoStr) {
        if (!isoStr) return '—';
        const parts = isoStr.split('-');
        if (parts.length !== 3) return isoStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
}
