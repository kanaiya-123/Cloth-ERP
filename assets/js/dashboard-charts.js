// CLOTHERP - Chart.js Visualizations & ERP Analytics

document.addEventListener('DOMContentLoaded', () => {
    // Chart.js Global Configuration Defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.plugins.tooltip.backgroundColor = '#0f172a';
        Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 13 };

        initHeroMiniChart();
        initMonthlySalesChart();
        initPurchaseVsSalesChart();
        initCategoryDonutChart();
    }
});

// Mini Chart in Hero Dashboard Preview
function initHeroMiniChart() {
    const ctx = document.getElementById('heroMiniChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM'],
            datasets: [{
                label: "Today's Hourly Revenue (₹)",
                data: [12400, 24600, 18900, 38500, 52300, 84200],
                borderColor: '#3b82f6',
                borderWidth: 2.5,
                fill: true,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return 'rgba(59, 130, 246, 0.1)';
                    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
                    return gradient;
                },
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#3b82f6',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` Sales: ₹${ctx.parsed.y.toLocaleString('en-IN')}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 10 } }
                },
                y: {
                    display: false,
                    grid: { display: false }
                }
            }
        }
    });
}

// 1. Monthly Sales Trend Chart (Reports & Analytics Section)
function initMonthlySalesChart() {
    const ctx = document.getElementById('monthlySalesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
            datasets: [
                {
                    label: 'Gross Sales (₹ in Lakhs)',
                    data: [8.2, 9.4, 11.1, 10.8, 12.5, 14.2, 16.8, 19.5, 18.2, 15.0, 16.4, 21.0],
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    fill: true,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 4,
                    pointBackgroundColor: '#38bdf8'
                },
                {
                    label: 'Net Margin (₹ in Lakhs)',
                    data: [2.1, 2.6, 3.2, 3.0, 3.8, 4.4, 5.2, 6.1, 5.8, 4.6, 5.1, 6.9],
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    tension: 0.35,
                    pointRadius: 3,
                    pointBackgroundColor: '#10b981'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 12, usePointStyle: true, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y} Lakhs`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: (v) => `₹${v}L`
                    }
                }
            }
        }
    });
}

// 2. Purchase vs Sales Overview Chart
function initPurchaseVsSalesChart() {
    const ctx = document.getElementById('purchaseVsSalesChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'],
            datasets: [
                {
                    label: 'Sales Revenue',
                    data: [28.7, 37.5, 54.5, 52.4],
                    backgroundColor: '#6366f1',
                    borderRadius: 6
                },
                {
                    label: 'Purchases (Fabric & Garments)',
                    data: [19.2, 24.8, 36.0, 33.1],
                    backgroundColor: '#334155',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { boxWidth: 12, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ₹${ctx.parsed.y}L`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#94a3b8',
                        callback: (v) => `₹${v}L`
                    }
                }
            }
        }
    });
}

// 3. Category Sales Donut Chart
function initCategoryDonutChart() {
    const ctx = document.getElementById('categoryDonutChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Formal Shirts', 'Casual Denim', 'Ethnic Wear', 'Knitwear & T-Shirts', 'Accessories'],
            datasets: [{
                data: [38, 26, 18, 12, 6],
                backgroundColor: [
                    '#38bdf8',
                    '#6366f1',
                    '#10b981',
                    '#f59e0b',
                    '#64748b'
                ],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, padding: 12, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}% of Total Sales`
                    }
                }
            }
        }
    });
}
