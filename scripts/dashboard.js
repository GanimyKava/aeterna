// Dashboard page initialization
(async function init() {
  const attractions = await window.EternityData.loadAttractions();
  const list = document.getElementById('list');
  const metrics = window.EternityMetrics.load();
  const views = metrics.attractionViews || {};

  const sorted = attractions
    .map(a => ({ a, v: views[a.id] || 0 }))
    .sort((x, y) => y.v - x.v);

  list.innerHTML = sorted.map(({a, v}) => (
    `<div class="item">
      <div>
        <div><strong>${a.name}</strong> <span class="small">(${a.type})</span></div>
        <div class="small">${a.city || ''}</div>
      </div>
      <div class="small">views: ${v}</div>
      <a class="small" href="${a.videoUrl}" target="_blank">video</a>
    </div>`
  )).join('');

  // Chart top 5
  const top = sorted.slice(0, 5);
  const ctx = document.getElementById('chart');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(x => x.a.name),
      datasets: [{
        label: 'Views',
        data: top.map(x => x.v),
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(41, 128, 185, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: { size: 14, weight: '500' },
          bodyFont: { size: 13 }
        }
      },
      scales: { 
        y: { 
          beginAtZero: true, 
          ticks: { 
            precision: 0,
            color: '#7f8c8d',
            font: { size: 12 }
          },
          grid: {
            color: '#e1e8ed'
          }
        },
        x: {
          ticks: {
            color: '#7f8c8d',
            font: { size: 12 }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
})();

