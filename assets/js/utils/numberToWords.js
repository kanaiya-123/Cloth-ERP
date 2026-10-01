// CLOTHERP - Indian Currency & Number to Words Utility

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertChunk(num) {
    let str = '';
    if (num >= 100) {
        str += ONES[Math.floor(num / 100)] + ' Hundred ';
        num %= 100;
    }
    if (num >= 20) {
        str += TENS[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ONES[num % 10] : '') + ' ';
    } else if (num > 0) {
        str += ONES[num] + ' ';
    }
    return str.trim();
}

/**
 * Convert a numeric amount into Indian Currency Words
 * Format: "Rupees [Words] and [Paise] Paise Only"
 * 
 * @param {number|string} amount 
 * @returns {string}
 */
export function amountInWords(amount) {
    const num = parseFloat(amount);
    if (isNaN(num) || num === 0) return 'Rupees Zero Only';

    const absNum = Math.abs(num);
    const rupees = Math.floor(absNum);
    const paise = Math.round((absNum - rupees) * 100);

    let crore = Math.floor(rupees / 10000000);
    let rem = rupees % 10000000;
    let lakh = Math.floor(rem / 100000);
    rem = rem % 100000;
    let thousand = Math.floor(rem / 1000);
    rem = rem % 1000;
    let hundredAndRest = rem;

    let parts = [];

    if (crore > 0) {
        parts.push(convertChunk(crore) + ' Crore');
    }
    if (lakh > 0) {
        parts.push(convertChunk(lakh) + ' Lakh');
    }
    if (thousand > 0) {
        parts.push(convertChunk(thousand) + ' Thousand');
    }
    if (hundredAndRest > 0) {
        parts.push(convertChunk(hundredAndRest));
    }

    let words = parts.join(' ').trim();
    if (!words) words = 'Zero';

    let result = 'Rupees ' + words;

    if (paise > 0) {
        result += ' and ' + convertChunk(paise) + ' Paise';
    }

    result += ' Only';
    return result;
}

/**
 * Format currency amount into Indian Rupee format (₹ XX,XXX.XX)
 * @param {number|string} val 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatCurrency(val, decimals = 2) {
    const n = parseFloat(val) || 0;
    return '₹ ' + n.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
