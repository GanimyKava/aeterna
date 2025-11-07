// Enhanced Dashboard with synthetic metrics
(async function init() {
  const attractions = await window.EternityData.loadAttractions();
  const metrics = window.EternityMetrics.load();
  const views = metrics.attractionViews || {};
  const visits = metrics.visits || {};

  // Generate synthetic data for comprehensive metrics
  const syntheticData = generateSyntheticData(attractions, views, visits);

  // Update KPI Cards
  updateKPIs(syntheticData);

  // Render attractions list
  renderAttractionsList(attractions, views, syntheticData);

  // Create all charts
  createCharts(attractions, syntheticData);

  // Create conversion funnel
  createConversionFunnel(syntheticData);
})();

function generateSyntheticData(attractions, views, visits) {
  // Base synthetic data that combines real metrics with synthetic enhancements
  const totalViews = Object.values(views).reduce((sum, v) => sum + v, 0) || 0;
  const totalVisits = Object.values(visits).reduce((sum, v) => sum + v, 0) || 0;

  // Generate realistic, positive synthetic data showing tourism growth
  const baseUsers = Math.max(8500, totalVisits * 3.5 + Math.floor(Math.random() * 500));
  const baseSessions = Math.max(24500, totalVisits * 4.2 + Math.floor(Math.random() * 800));
  
  return {
    // User Experience Metrics - Positive growth indicators
    totalUsers: baseUsers,
    totalSessions: baseSessions,
    avgSessionDuration: 6.8 + Math.random() * 1.2, // minutes - increased engagement
    detectionRate: 87.3 + Math.random() * 5, // percentage - high success rate
    videoCompletionRate: 78.5 + Math.random() * 8, // percentage - strong engagement
    
    // AR Mode Usage - Growing adoption
    modeUsage: {
      'Image-based AR': Math.floor(baseSessions * 0.45) || 11025,
      'Marker-based AR': Math.floor(baseSessions * 0.32) || 7840,
      'Location-based AR': Math.floor(baseSessions * 0.23) || 5635
    },
    
    // Session Duration Distribution (minutes) - Showing longer engagement
    sessionDuration: {
      '0-2 min': 2450,
      '2-5 min': 6125,
      '5-10 min': 9800,
      '10-15 min': 4900,
      '15+ min': 1225
    },
    
    // Peak Usage Hours (24-hour format) - Tourism peak times
    peakHours: Array.from({length: 24}, (_, i) => {
      // Peak at 10am, 2pm, 6pm - prime tourism hours
      let base = 120;
      if (i === 10 || i === 14 || i === 18) base = 450; // Peak hours
      else if (i >= 8 && i <= 20) base = 200 + Math.sin((i - 8) * Math.PI / 12) * 150;
      else base = 80; // Off-hours still active
      return Math.floor(base + Math.random() * 50);
    }),
    
    // Video Completion by Attraction - High engagement
    completionByAttraction: attractions.map(a => ({
      name: a.name,
      completion: 72 + Math.random() * 18, // 72-90% completion rate
      views: Math.max(views[a.id] || 0, Math.floor(1200 + Math.random() * 1800)) // Always show high views: 1200-3000
    })),
    
    // Commercial Metrics - Positive revenue trends with high revenue
    revenueByAttraction: attractions.map(a => {
      const baseViews = Math.max(views[a.id] || 0, Math.floor(1200 + Math.random() * 1800)); // Always use high views
      // Higher revenue per view: $8-15 per view, showing strong monetization
      const revenuePerView = 8.5 + Math.random() * 6.5;
      const totalRevenue = baseViews * revenuePerView;
      // Ensure minimum revenue of $15,000 per attraction
      return {
        name: a.name,
        revenue: Math.max(totalRevenue, Math.floor(15000 + Math.random() * 25000)), // High revenue: $15K-$40K+ per attraction
        engagement: 75 + Math.random() * 20 // 75-95% engagement
      };
    }),
    
    // Weekly Trends (last 7 days) - Showing growth trend
    weeklyTrends: Array.from({length: 7}, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      // Growing trend with weekend peaks
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      const baseSessions = 3200 + (i * 180); // Growing trend
      const baseRevenue = 12800 + (i * 720); // Growing revenue
      return {
        day: day.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: Math.floor(baseSessions + (isWeekend ? 400 : 0) + Math.sin(i * 0.8) * 200 + Math.random() * 150),
        revenue: Math.floor(baseRevenue + (isWeekend ? 1600 : 0) + Math.sin(i * 0.8) * 800 + Math.random() * 400)
      };
    }),
    
    // Tourism Metrics - Strong city performance
    cityData: attractions.reduce((acc, a) => {
      const city = a.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = {
          visits: 0,
          revenue: 0,
          attractions: 0
        };
      }
      const baseVisits = views[a.id] || Math.floor(1200 + Math.random() * 800);
      acc[city].visits += baseVisits;
      acc[city].revenue += baseVisits * (4.5 + Math.random() * 2.5); // Higher revenue per visit
      acc[city].attractions += 1;
      return acc;
    }, {}),
    
    // Location-based engagement - High engagement rates
    locationEngagement: attractions
      .filter(a => a.type === 'location')
      .map(a => ({
        name: a.name,
        engagement: 82 + Math.random() * 13, // 82-95% engagement
        visitors: views[a.id] || Math.floor(1500 + Math.random() * 1000)
      })),
    
    // Tourist Flow (last 7 days) - Growing trend
    touristFlow: Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const baseVisitors = 2800 + (i * 120); // Growing daily
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visitors: Math.floor(baseVisitors + Math.sin(i * 0.9) * 300 + Math.random() * 200)
      };
    }),
    
    // Seasonal Trends (last 12 months) - Strong growth pattern
    seasonalTrends: Array.from({length: 12}, (_, i) => {
      const month = new Date(2024, i, 1);
      // Higher in summer months (Dec-Feb in Australia) with growth trend
      const isPeak = i === 11 || i === 0 || i === 1;
      const growthFactor = 1 + (i * 0.08); // 8% monthly growth
      const baseVisitors = isPeak ? 8500 : 4200;
      const baseRevenue = isPeak ? 34000 : 16800;
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        visitors: Math.floor(baseVisitors * growthFactor + Math.random() * 800),
        revenue: Math.floor(baseRevenue * growthFactor + Math.random() * 3200)
      };
    }),
    
    // Conversion Funnel - Improved conversion rates
    conversionFunnel: {
      'Page Views': 38500,
      'AR Sessions Started': 24500,
      'Markers Detected': 21560,
      'Videos Played': 19225,
      'Videos Completed': 15075
    },
    
    // Active locations
    activeLocations: attractions.filter(a => 
      a.type === 'location' && (views[a.id] || 0) > 0
    ).length || attractions.filter(a => a.type === 'location').length,
    
    // Total Revenue Potential - High futuristic value
    totalRevenuePotential: (() => {
      const revenueArray = attractions.map(a => {
        const baseViews = views[a.id] || Math.floor(1200 + Math.random() * 1800);
        const revenuePerView = 8.5 + Math.random() * 6.5;
        return baseViews * revenuePerView;
      });
      const calculated = revenueArray.reduce((sum, r) => sum + r, 0);
      // Ensure minimum of $250K for futuristic appeal
      return Math.max(250000, calculated);
    })()
  };
}

function updateKPIs(data) {
  document.getElementById('total-users').textContent = data.totalUsers.toLocaleString();
  document.getElementById('total-sessions').textContent = data.totalSessions.toLocaleString();
  document.getElementById('avg-session').textContent = `${data.avgSessionDuration.toFixed(1)}m`;
  document.getElementById('detection-rate').textContent = `${data.detectionRate.toFixed(1)}%`;
  
  // Use totalRevenuePotential from synthetic data, or calculate from revenueByAttraction
  let revenuePotential = data.totalRevenuePotential;
  
  if (!revenuePotential || revenuePotential === 0) {
    // Fallback: calculate from revenueByAttraction array
    if (Array.isArray(data.revenueByAttraction) && data.revenueByAttraction.length > 0) {
      revenuePotential = data.revenueByAttraction.reduce((sum, r) => sum + (r.revenue || 0), 0);
    }
    // Ensure minimum futuristic value of $250K
    revenuePotential = Math.max(250000, revenuePotential || 0);
  }
  
  document.getElementById('revenue-potential').textContent = `$${revenuePotential.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
  
  document.getElementById('active-locations').textContent = data.activeLocations;
}

function renderAttractionsList(attractions, views, syntheticData) {
  const list = document.getElementById('list');
  const sorted = attractions
    .map(a => {
      // Use synthetic views instead of real views to ensure high positive numbers
      const syntheticViews = syntheticData.completionByAttraction.find(c => c.name === a.name)?.views;
      const viewCount = syntheticViews || Math.floor(1200 + Math.random() * 1800); // Fallback: 1200-3000 views
      const revenue = syntheticData.revenueByAttraction.find(r => r.name === a.name)?.revenue;
      // Ensure revenue is always a high positive number
      const finalRevenue = revenue && revenue > 0 ? revenue : Math.floor(15000 + Math.random() * 25000); // Fallback: $15K-$40K
      const completion = syntheticData.completionByAttraction.find(c => c.name === a.name)?.completion || 0;
      return { a, viewCount, revenue: finalRevenue, completion };
    })
    .sort((x, y) => y.viewCount - x.viewCount);

  list.innerHTML = sorted.map(({a, viewCount, revenue, completion}) => (
    `<div class="item" data-video-url="${a.videoUrl}">
      <div>
        <div><strong>${a.name}</strong> <span class="small">(${a.type})</span></div>
        <div class="small">${a.city || ''} • Completion: ${completion.toFixed(1)}%</div>
      </div>
      <div style="text-align: right;">
        <div class="small">Views: ${viewCount}</div>
        <div class="small" style="color: #27ae60; font-weight: 600;">$${revenue.toFixed(0)}</div>
      </div>
      <button class="video-preview-btn" data-video-url="${a.videoUrl}" title="Preview video">
        <span style="font-size: 16px;">▶️</span>
      </button>
    </div>`
  )).join('');
  
  // Add video preview functionality
  setupVideoPreviews();
}

function createCharts(attractions, data) {
  const chartConfig = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
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
        grid: { color: '#e1e8ed' }
      },
      x: {
        ticks: {
          color: '#7f8c8d',
          font: { size: 12 }
        },
        grid: { display: false }
      }
    }
  };

  // Top Attractions Chart
  const sorted = attractions
    .map(a => ({ name: a.name, views: data.completionByAttraction.find(c => c.name === a.name)?.views || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  new Chart(document.getElementById('chart-views'), {
    type: 'bar',
    data: {
      labels: sorted.map(x => x.name),
      datasets: [{
        label: 'Views',
        data: sorted.map(x => x.views),
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(41, 128, 185, 1)',
        borderWidth: 1
      }]
    },
    options: { ...chartConfig, plugins: { ...chartConfig.plugins, legend: { display: false } } }
  });

  // AR Mode Usage (Doughnut)
  new Chart(document.getElementById('chart-modes'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(data.modeUsage),
      datasets: [{
        data: Object.values(data.modeUsage),
        backgroundColor: [
          'rgba(52, 152, 219, 0.8)',
          'rgba(46, 204, 113, 0.8)',
          'rgba(241, 196, 15, 0.8)'
        ],
        borderColor: [
          'rgba(41, 128, 185, 1)',
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: chartConfig
  });

  // Video Completion Rate (Bar)
  new Chart(document.getElementById('chart-completion'), {
    type: 'bar',
    data: {
      labels: data.completionByAttraction.map(a => a.name.length > 20 ? a.name.substring(0, 20) + '...' : a.name),
      datasets: [{
        label: 'Completion %',
        data: data.completionByAttraction.map(a => a.completion),
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 1
      }]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          max: 100,
          ticks: {
            ...chartConfig.scales.y.ticks,
            callback: function(value) { return value + '%'; }
          }
        }
      }
    }
  });

  // Session Duration Distribution (Bar)
  new Chart(document.getElementById('chart-duration'), {
    type: 'bar',
    data: {
      labels: Object.keys(data.sessionDuration),
      datasets: [{
        label: 'Sessions',
        data: Object.values(data.sessionDuration),
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 1
      }]
    },
    options: chartConfig
  });

  // Peak Usage Hours (Line)
  new Chart(document.getElementById('chart-peak-hours'), {
    type: 'line',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [{
        label: 'Active Sessions',
        data: data.peakHours,
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: chartConfig
  });

  // Revenue by Attraction (Bar)
  const revenueSorted = [...data.revenueByAttraction].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  new Chart(document.getElementById('chart-revenue'), {
    type: 'bar',
    data: {
      labels: revenueSorted.map(r => r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name),
      datasets: [{
        label: 'Revenue ($)',
        data: revenueSorted.map(r => r.revenue),
        backgroundColor: 'rgba(241, 196, 15, 0.8)',
        borderColor: 'rgba(243, 156, 18, 1)',
        borderWidth: 1
      }]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          ticks: {
            ...chartConfig.scales.y.ticks,
            callback: function(value) { return '$' + value.toLocaleString(); }
          }
        }
      }
    }
  });

  // Engagement Score (Bar)
  new Chart(document.getElementById('chart-engagement'), {
    type: 'bar',
    data: {
      labels: data.revenueByAttraction.map(r => r.name.length > 15 ? r.name.substring(0, 15) + '...' : r.name),
      datasets: [{
        label: 'Engagement Score',
        data: data.revenueByAttraction.map(r => r.engagement),
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(41, 128, 185, 1)',
        borderWidth: 1
      }]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          max: 100,
          ticks: {
            ...chartConfig.scales.y.ticks,
            callback: function(value) { return value + '%'; }
          }
        }
      }
    }
  });

  // Weekly Trends (Line)
  new Chart(document.getElementById('chart-weekly'), {
    type: 'line',
    data: {
      labels: data.weeklyTrends.map(w => w.day),
      datasets: [
        {
          label: 'Sessions',
          data: data.weeklyTrends.map(w => w.sessions),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Revenue ($)',
          data: data.weeklyTrends.map(w => w.revenue),
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          type: 'linear',
          position: 'left'
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            callback: function(value) { return '$' + value.toLocaleString(); }
          }
        }
      }
    }
  });

  // Popular Cities (Bar)
  const cityEntries = Object.entries(data.cityData)
    .map(([city, data]) => ({ city, visits: data.visits }))
    .sort((a, b) => b.visits - a.visits);
  
  new Chart(document.getElementById('chart-cities'), {
    type: 'bar',
    data: {
      labels: cityEntries.map(c => c.city),
      datasets: [{
        label: 'Visits',
        data: cityEntries.map(c => c.visits),
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(142, 68, 173, 1)',
        borderWidth: 1
      }]
    },
    options: chartConfig
  });

  // Location-Based Engagement (Bar)
  new Chart(document.getElementById('chart-location'), {
    type: 'bar',
    data: {
      labels: data.locationEngagement.map(l => l.name.length > 20 ? l.name.substring(0, 20) + '...' : l.name),
      datasets: [{
        label: 'Engagement %',
        data: data.locationEngagement.map(l => l.engagement),
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: 'rgba(192, 57, 43, 1)',
        borderWidth: 1
      }]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          max: 100,
          ticks: {
            ...chartConfig.scales.y.ticks,
            callback: function(value) { return value + '%'; }
          }
        }
      }
    }
  });

  // Tourist Flow (Line)
  new Chart(document.getElementById('chart-flow'), {
    type: 'line',
    data: {
      labels: data.touristFlow.map(t => t.date),
      datasets: [{
        label: 'Daily Visitors',
        data: data.touristFlow.map(t => t.visitors),
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: chartConfig
  });

  // Seasonal Trends (Line with dual axis)
  new Chart(document.getElementById('chart-seasonal'), {
    type: 'line',
    data: {
      labels: data.seasonalTrends.map(s => s.month),
      datasets: [
        {
          label: 'Visitors',
          data: data.seasonalTrends.map(s => s.visitors),
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Revenue ($)',
          data: data.seasonalTrends.map(s => s.revenue),
          borderColor: 'rgba(46, 204, 113, 1)',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      ...chartConfig,
      scales: {
        ...chartConfig.scales,
        y: {
          ...chartConfig.scales.y,
          type: 'linear',
          position: 'left'
        },
        y1: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            callback: function(value) { return '$' + (value / 1000).toFixed(0) + 'k'; }
          }
        }
      }
    }
  });
}

function createConversionFunnel(data) {
  const funnel = document.getElementById('funnel');
  const steps = Object.entries(data.conversionFunnel);
  const maxValue = Math.max(...Object.values(data.conversionFunnel));
  
  funnel.innerHTML = steps.map(([label, value], index) => {
    const percentage = ((value / maxValue) * 100).toFixed(1);
    const conversionRate = index > 0 
      ? ((value / steps[index - 1][1]) * 100).toFixed(1) + '%'
      : '100%';
    
    return `
      <div class="funnel-item">
        <div>
          <div class="funnel-label">${label}</div>
          <div class="small" style="color: rgba(255,255,255,0.8); margin-top: 4px;">
            Conversion: ${conversionRate} • ${percentage}% of peak
          </div>
        </div>
        <div class="funnel-value">${value.toLocaleString()}</div>
      </div>
    `;
  }).join('');
}

function setupVideoPreviews() {
  const previewBtns = document.querySelectorAll('.video-preview-btn');
  let currentPreview = null;
  
  previewBtns.forEach(btn => {
    const videoUrl = btn.getAttribute('data-video-url');
    if (!videoUrl) return;
    
    // Create preview container
    const preview = document.createElement('div');
    preview.className = 'video-preview';
    preview.innerHTML = `
      <div class="video-preview-content">
        <button class="video-preview-close" aria-label="Close preview">×</button>
        <video controls muted playsinline>
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `;
    document.body.appendChild(preview);
    
    // Show preview on button click
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Hide previous preview if any
      if (currentPreview && currentPreview !== preview) {
        currentPreview.classList.remove('active');
        const prevVideo = currentPreview.querySelector('video');
        if (prevVideo) prevVideo.pause();
      }
      
      // Show this preview
      preview.classList.add('active');
      const video = preview.querySelector('video');
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {
          // Autoplay might be blocked, that's okay
        });
      }
      currentPreview = preview;
    });
    
    // Close button
    const closeBtn = preview.querySelector('.video-preview-close');
    closeBtn.addEventListener('click', () => {
      preview.classList.remove('active');
      const video = preview.querySelector('video');
      if (video) video.pause();
      currentPreview = null;
    });
    
    // Close on background click
    preview.addEventListener('click', (e) => {
      if (e.target === preview) {
        preview.classList.remove('active');
        const video = preview.querySelector('video');
        if (video) video.pause();
        currentPreview = null;
      }
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentPreview) {
      currentPreview.classList.remove('active');
      const video = currentPreview.querySelector('video');
      if (video) video.pause();
      currentPreview = null;
    }
  });
}
