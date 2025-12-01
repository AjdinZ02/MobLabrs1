import { renderProducts } from './pages/ProductsPage';
import { renderContact } from './pages/ContactPage';
import { renderBrands } from './pages/BrandsPage';
import { renderProductsAdmin } from './pages/ProductsAdminPage';
import {renderReviewsPage} from './pages/ReviewsPage';

type RouteKey = '/' | '/proizvodi' | '/kontakt' | '/brendovi' | '/proizvodi-admin' | '/recenzije';

function getRouteFromHash(): RouteKey {
  const path = location.hash.replace('#', '').trim() || '/';
  if (path.startsWith('/proizvodi-admin')) return '/proizvodi-admin';
  if (path.startsWith('/brendovi')) return '/brendovi';
  if (path.startsWith('/kontakt')) return '/kontakt';
  if (path.startsWith('/recenzije')) return '/recenzije';
  if (path.startsWith('/proizvodi') || path === '/') return '/proizvodi';
  return '/proizvodi';
}

export function setupApp(root: HTMLElement): void {
  if (!root) return;

  root.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#/proizvodi" class="logo">
          <img src="/images/brands/MobLabLogo.png" alt="MobLab" />
        </a>
        <nav class="nav">
          <a href="#/proizvodi" class="nav-link" data-link="/proizvodi">Proizvodi</a>
          <a href="#/brendovi" class="nav-link" data-link="/brendovi">Brendovi</a>
          <a href="#/proizvodi-admin" class="nav-link" data-link="/proizvodi-admin">Proizvodi (Admin)</a>
          <a href="#/kontakt" class="nav-link" data-link="/kontakt">Kontakt</a>
          <a href="#/recenzije" class="nav-link" data-link="/recenzije">Recenzije</a>
        </nav>
      </div>
    </header>
    <main class="site-main">
      <div class="container" id="page-container"></div>
    </main>
    
  `;

  const container = document.getElementById('page-container') as HTMLElement;
  const links = root.querySelectorAll<HTMLAnchorElement>('a[data-link]');
  const setActive = (route: RouteKey) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('data-link') === route));
  };

  const render = () => {
    const route = getRouteFromHash();
    setActive(route);
    if (route === '/proizvodi') return renderProducts(container);
    if (route === '/brendovi') return renderBrands(container);
    if (route === '/kontakt') return renderContact(container);
    if(route === '/recenzije'){
      renderReviewsPage(container);
      return;
    }
    if (route === '/proizvodi-admin') return renderProductsAdmin(container);
    return renderProducts(container);
  };

  window.addEventListener('hashchange', render);
  render();
}


