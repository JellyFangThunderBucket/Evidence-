// Main JavaScript logic for Evidence
// Uses miniappsAI.storage for reliable cross-browser persistence

// State
let victories = [];
let searchTerm = '';
let activeCategory = 'All';

// DOM Elements
const form = document.getElementById('victory-form');
const input = document.getElementById('victory-text');
const select = document.getElementById('category-select');
const timelineContainer = document.getElementById('timeline-container');
const emptyState = document.getElementById('empty-state');
const countDisplay = document.getElementById('count-display');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const exportBtn = document.getElementById('export-btn');

// Constants
const STORAGE_KEY = 'evidence_victories';

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  await loadVictories();
  renderTimeline();

  // Search listener
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderTimeline();
  });

  // Filter listeners
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderTimeline();
    });
  });

  // Export button
  exportBtn.addEventListener('click', exportTimeline);
});

// Event Listeners
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const text = input.value.trim();
  const category = select.value;
  
  if (!text) return;

  const newVictory = {
    id: Date.now().toString(),
    text,
    category,
    timestamp: new Date().toISOString()
  };

  victories.unshift(newVictory);
  await saveVictories();
  
  input.value = '';
  renderTimeline();
});

// Storage Functions (Using miniappsAI.storage)
async function loadVictories() {
  try {
    const stored = await miniappsAI.storage.getItem(STORAGE_KEY);
    if (stored) {
      victories = JSON.parse(stored);
    } else {
      victories = [];
    }
  } catch (error) {
    console.error('Failed to load victories:', error);
    victories = [];
  }
}

async function saveVictories() {
  try {
    await miniappsAI.storage.setItem(STORAGE_KEY, JSON.stringify(victories));
  } catch (error) {
    console.error('Failed to save victories:', error);
    alert('Could not save victory. Storage might be full.');
  }
}

// Delete victory
async function deleteVictory(id) {
  if (!confirm('Remove this victory from your timeline?')) return;
  
  victories = victories.filter(v => v.id !== id);
  await saveVictories();
  renderTimeline();
}

// Export timeline as JSON
function exportTimeline() {
  if (victories.length === 0) {
    alert('No victories to export yet.');
    return;
  }

  const dataStr = JSON.stringify(victories, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `evidence-timeline-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Formatting
function formatTime(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Rendering
function renderTimeline() {
  // Update count
  countDisplay.textContent = `${victories.length} victor${victories.length === 1 ? 'y' : 'ies'}`;

  // Filter victories
  let filtered = victories;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(v => v.category === activeCategory);
  }

  if (searchTerm) {
    filtered = filtered.filter(v => 
      v.text.toLowerCase().includes(searchTerm)
    );
  }

  // Handle empty state
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
    const items = timelineContainer.querySelectorAll('.victory-item');
    items.forEach(el => el.remove());
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  // Clear current list items
  const items = timelineContainer.querySelectorAll('.victory-item');
  items.forEach(el => el.remove());

  // Render items
  filtered.forEach(victory => {
    const el = document.createElement('div');
    el.className = 'victory-item';
    
    const badgeClass = `badge-${victory.category}`;
    
    el.innerHTML = `
      <div class="timeline-dot-wrapper">
        <div class="timeline-dot"></div>
      </div>
      
      <div class="victory-content">
        <div class="victory-meta">
          <span class="victory-badge ${badgeClass}">
            ${victory.category}
          </span>
          <div class="victory-actions">
            <time class="victory-time">${formatTime(victory.timestamp)}</time>
            <button class="delete-btn" aria-label="Delete victory" data-id="${victory.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="victory-text">${escapeHtml(victory.text)}</p>
      </div>
    `;

    // Attach delete handler
    const deleteBtn = el.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteVictory(victory.id));

    timelineContainer.appendChild(el);
  });
}
