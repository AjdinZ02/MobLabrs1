
export function renderReviewsPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="reviews-page">
      <div class="reviews-card">
        <div class="reviews-header">
          <h1>Recenzije proizvoda</h1>
          <span class="badge">Beta</span>
        </div>

        <!-- Filter -->
        <div style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
          <label for="filter-rating" style="margin-right:8px;">Filtriraj po ocjeni:</label>
          <select id="filter-rating" class="select">
            <option value="all">Sve</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        <!-- Lista recenzija -->
        <div class="reviews-list" id="reviews-list">Učitavanje recenzija...</div>

        <!-- Paginacija -->
        <div id="pagination" style="padding: 10px 20px; display:flex; gap:8px; justify-content:center;"></div>

        <!-- Forma -->
        <div class="review-form">
          <h2 style="margin:0 0 14px 0;">Dodaj recenziju</h2>
          <form id="add-review-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="label" for="productName">Naziv proizvoda</label>
                <input class="input" id="productName" type="text" placeholder="npr. iPhone 15 Pro" required />
              </div>
              <div class="form-group">
                <label class="label" for="userName">Vaše ime</label>
                <input class="input" id="userName" type="text" placeholder="npr. Ajdin" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">Ocjena</label>
                <div class="stars" id="rating-stars">
                  ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
                </div>
                <input id="rating" type="hidden" value="5" />
              </div>
              <div class="form-group">
                <label class="label" for="comment">Vaša recenzija</label>
                <textarea class="textarea" id="comment" placeholder="Podijelite vaše iskustvo..." required></textarea>
              </div>
            </div>
            <div class="btn-row">
              <button class="btn" type="button" id="clear-btn">Očisti</button>
              <button class="btn primary" type="submit" id="submit-btn">Dodaj recenziju</button>
            </div>
            <div id="form-status" aria-live="polite"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Zvjezdice
  const stars = Array.from(document.querySelectorAll<HTMLSpanElement>('#rating-stars .star'));
  const ratingInput = document.getElementById('rating') as HTMLInputElement;
  const setActive = (n: number) => {
    stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= n));
    ratingInput.value = String(n);
  };
  stars.forEach(s => s.addEventListener('click', () => setActive(Number(s.dataset.value))));
  setActive(5);

  // Globalne varijable za paginaciju
  let allReviews: any[] = [];
  let currentPage = 1;
  const perPage = 5;

  // Učitavanje recenzija
  async function loadReviews() {
    const res = await fetch('http://localhost:5000/api/reviews');
    allReviews = await res.json();
    renderReviews();
  }

  // Render sa filterom i paginacijom
  function renderReviews() {
    const filterValue = (document.getElementById('filter-rating') as HTMLSelectElement).value;
    let filtered = allReviews;
    if (filterValue !== 'all') {
      filtered = allReviews.filter(r => r.rating == Number(filterValue));
    }

    const start = (currentPage - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    const listEl = document.getElementById('reviews-list')!;
    if (!paginated.length) {
      listEl.innerHTML = `<div class="review-meta">Nema recenzija za odabrani filter.</div>`;
    } else {
      listEl.innerHTML = paginated.map(r => `
        <div class="review-item">
          <div>
            <div class="review-title">${escapeHtml(r.productName)} — ${escapeHtml(r.userName)}</div>
            <div class="review-meta">Ocjena: ${r.rating}/5</div>
            <div style="margin-top:6px;">${escapeHtml(r.comment)}</div>
          </div>
          <div>${renderStars(r.rating)}</div>
        </div>
      `).join('');
    }

    renderPagination(filtered.length);
  }

  // Paginacija
  function renderPagination(total: number) {
    const pages = Math.ceil(total / perPage);
    const paginationEl = document.getElementById('pagination')!;
    paginationEl.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.textContent = String(i);
      btn.className = 'btn' + (i === currentPage ? ' primary' : '');
      btn.addEventListener('click', () => {
        currentPage = i;
        renderReviews();
      });
      paginationEl.appendChild(btn);
    }
  }

  // Filter event
  document.getElementById('filter-rating')!.addEventListener('change', () => {
    currentPage = 1;
    renderReviews();
  });

  // Submit forme
  const form = document.getElementById('add-review-form') as HTMLFormElement;
  const status = document.getElementById('form-status')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productName = (document.getElementById('productName') as HTMLInputElement).value.trim();
    const userName = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const rating = Number(ratingInput.value);
    const comment = (document.getElementById('comment') as HTMLTextAreaElement).value.trim();

    if (!productName || !userName || !comment) {
      status.innerHTML = `<div class="alert error">Popunite sva polja.</div>`;
      return;
    }

    try {
      await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, userName, rating, comment })
      });
      status.innerHTML = `<div class="alert success">Recenzija dodana!</div>`;
      form.reset();
      setActive(5);
      await loadReviews();
    } catch {
      status.innerHTML = `<div class="alert error">Greška pri dodavanju.</div>`;
    }
  });

  // Init
  loadReviews();
}

function renderStars(n: number) {
  return [1,2,3,4,5].map(i => `<span class="star ${i<=n?'active':''}">★</span>`).join('');
}
function escapeHtml(str: string) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
