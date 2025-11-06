// Admin page initialization
const ed = document.getElementById('editor');
const list = document.getElementById('list');

function renderPreview(attractions) {
  list.innerHTML = attractions.map(a => (
    `<div class="item">
      <div>
        <div><strong>${a.name}</strong> <span class="small">(${a.type})</span></div>
        <div class="small">${a.description || ''}</div>
      </div>
      <div class="small">${a.city || ''}</div>
    </div>`
  )).join('');
}

async function loadCurrent() {
  const data = await window.EternityData.loadAttractions();
  // Display as YAML if js-yaml is available, otherwise JSON
  const yaml = typeof jsyaml !== 'undefined' ? jsyaml : (typeof jsYAML !== 'undefined' ? jsYAML : null);
  if (yaml) {
    ed.value = yaml.dump(data, { indent: 2, lineWidth: -1 });
  } else {
    ed.value = JSON.stringify(data, null, 2);
  }
  renderPreview(data);
}

document.getElementById('btn-load').addEventListener('click', loadCurrent);

document.getElementById('btn-apply').addEventListener('click', () => {
  try {
    let parsed;
    // Try parsing as YAML first, then JSON
    const yaml = typeof jsyaml !== 'undefined' ? jsyaml : (typeof jsYAML !== 'undefined' ? jsYAML : null);
    if (yaml) {
      try {
        parsed = yaml.load(ed.value);
      } catch (yamlError) {
        parsed = JSON.parse(ed.value);
      }
    } else {
      parsed = JSON.parse(ed.value);
    }
    if (!Array.isArray(parsed)) throw new Error('Root must be an array');
    window.EternityData.saveAttractionsOverride(parsed);
    renderPreview(parsed);
    alert('Local override saved. Commit the downloaded YAML to persist in repo.');
  } catch (e) {
    alert('Invalid YAML/JSON: ' + e.message);
  }
});

document.getElementById('btn-clear').addEventListener('click', () => {
  window.EternityData.clearAttractionsOverride();
  alert('Override cleared. Reload to use repository YAML.');
});

document.getElementById('btn-download').addEventListener('click', () => {
  try {
    let parsed, content, filename, mimeType;
    // Try parsing as YAML first, then JSON
    const yaml = typeof jsyaml !== 'undefined' ? jsyaml : (typeof jsYAML !== 'undefined' ? jsYAML : null);
    if (yaml) {
      try {
        parsed = yaml.load(ed.value);
        content = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
        filename = 'attractions.yaml';
        mimeType = 'text/yaml';
      } catch (yamlError) {
        parsed = JSON.parse(ed.value);
        content = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
        filename = 'attractions.yaml';
        mimeType = 'text/yaml';
      }
    } else {
      parsed = JSON.parse(ed.value);
      content = JSON.stringify(parsed, null, 2);
      filename = 'attractions.json';
      mimeType = 'application/json';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert('Fix YAML/JSON before download.');
  }
});

document.getElementById('file').addEventListener('change', (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    ed.value = text;
    try {
      let parsed;
      // Try parsing as YAML first, then JSON
      const yaml = typeof jsyaml !== 'undefined' ? jsyaml : (typeof jsYAML !== 'undefined' ? jsYAML : null);
      if (yaml) {
        try {
          parsed = yaml.load(text);
        } catch (yamlError) {
          parsed = JSON.parse(text);
        }
      } else {
        parsed = JSON.parse(text);
      }
      renderPreview(parsed);
    } catch (_) {
      // Preview will show error when user tries to apply
    }
  };
  reader.readAsText(f);
});

loadCurrent();
