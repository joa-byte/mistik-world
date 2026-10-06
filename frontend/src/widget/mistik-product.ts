type ProductImage = {
  id?: string;
  url: string;
  alt: string | null;
};

type Product = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number | null;
  sizes: number[];
  coverImage: ProductImage | null;
  images?: ProductImage[];
};

type CartItem = {
  projectId: string;
  slug: string;
  title: string;
  price: number | null;
  size: number | null;
  quantity: number;
  imageUrl: string | null;
};

const CART_KEY = 'mistik-cart-v1';

const styles = `
  :host {
    display: block;
    color: #111;
    font-family: Arial, Helvetica, sans-serif;
    --mistik-red: #ff1919;
  }

  * {
    box-sizing: border-box;
  }

  a {
    color: inherit;
  }

  button {
    font: inherit;
  }

  .state {
    min-height: 240px;
    display: grid;
    place-items: center;
    font-size: 14px;
  }

  .product {
    width: 100%;
  }

  .back {
    display: inline-block;
    margin: 0 0 24px;
    padding: 5px 18px;
    border: 1px solid #111;
    text-decoration: none;
    font-size: 16px;
  }

  .hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 1.4fr);
    gap: 36px;
    align-items: start;
  }

  .gallery {
    position: relative;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background: #f2f2f2;
  }

  .gallery img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .gallery__nav {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  .gallery__button {
    width: 48px;
    height: 64px;
    border: 0;
    background: rgba(0,0,0,.42);
    color: white;
    font-size: 38px;
    line-height: 1;
    cursor: pointer;
    pointer-events: auto;
  }

  .info h1 {
    margin: -6px 0 6px;
    font-size: clamp(38px, 5vw, 68px);
    line-height: .95;
    letter-spacing: -.045em;
  }

  .subtitle,
  .description {
    color: var(--mistik-red);
    font-size: 19px;
    line-height: 1.35;
  }

  .subtitle {
    margin: 0 0 18px;
  }

  .sizes-label {
    display: block;
    margin-bottom: 7px;
    font-size: 17px;
  }

  .sizes {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 28px;
  }

  .size {
    min-width: 49px;
    height: 47px;
    padding: 0 12px;
    border: 1px solid #111;
    background: transparent;
    cursor: pointer;
    font-size: 18px;
  }

  .size[aria-pressed="true"] {
    background: rgba(255, 25, 25, .35);
  }

  .buy {
    margin-top: 44px;
  }

  .price {
    margin: 0 0 10px;
    color: var(--mistik-red);
    font-size: clamp(42px, 5vw, 58px);
    font-weight: 700;
    text-align: right;
    letter-spacing: -.03em;
  }

  .add {
    width: 100%;
    min-height: 42px;
    border: 0;
    background: var(--mistik-red);
    color: white;
    cursor: pointer;
    font-size: 16px;
  }

  .add:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .added {
    min-height: 21px;
    margin: 8px 0 0;
    text-align: right;
    font-size: 13px;
  }

  .description {
    margin: 88px 4px 100px;
    max-width: 760px;
  }

  .related h2 {
    margin: 0 0 22px;
    text-align: center;
    font-size: 20px;
  }

  .related__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 44px;
    max-width: 760px;
    margin: 0 auto;
  }

  .card {
    text-decoration: none;
    color: var(--mistik-red);
    font-size: 12px;
  }

  .card__image {
    aspect-ratio: 1 / 1;
    margin-bottom: 8px;
    overflow: hidden;
    background: #f2f2f2;
  }

  .card__image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }

  .card__meta {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  @media (max-width: 720px) {
    .hero {
      grid-template-columns: 1fr;
      gap: 22px;
    }

    .info h1 {
      margin-top: 0;
    }

    .buy {
      margin-top: 30px;
    }

    .price {
      text-align: left;
    }

    .added {
      text-align: left;
    }

    .description {
      margin: 54px 0 68px;
    }

    .related__grid {
      gap: 14px;
    }

    .back {
      margin-bottom: 16px;
    }
  }
`;

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function joinProductUrl(baseUrl: string, slug: string) {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalized}${encodeURIComponent(slug)}`;
}

function readCart(): CartItem[] {
  try {
    const value = localStorage.getItem(CART_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function addToCart(item: CartItem) {
  const cart = readCart();
  const existing = cart.find(
    (entry) => entry.projectId === item.projectId && entry.size === item.size,
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(
    new CustomEvent('mistik:cart-updated', {
      detail: {
        items: cart,
        count: cart.reduce((total, entry) => total + entry.quantity, 0),
      },
    }),
  );
}

function uniqueImages(product: Product) {
  const images = [product.coverImage, ...(product.images ?? [])].filter(
    (image): image is ProductImage => Boolean(image?.url),
  );

  return images.filter(
    (image, index) =>
      images.findIndex((candidate) => candidate.url === image.url) === index,
  );
}

function renderCard(product: Product, baseUrl: string) {
  const image = product.coverImage;
  return `
    <a class="card" href="${joinProductUrl(baseUrl, product.slug)}">
      <div class="card__image">
        ${
          image
            ? `<img src="${image.url}" alt="${image.alt ?? product.title}">`
            : ''
        }
      </div>
      <div class="card__meta">
        <span>${product.title}</span>
        <span>${product.price === null ? 'Consultar' : money.format(product.price)}</span>
      </div>
    </a>
  `;
}

async function mountProduct(element: HTMLElement) {
  const slug = element.dataset.mistikProduct;
  const apiUrl = element.dataset.apiUrl?.replace(/\/$/, '');
  const catalogUrl = element.dataset.catalogUrl || '/';
  const productBaseUrl = element.dataset.productBaseUrl || '/products/';

  if (!slug || !apiUrl) {
    element.textContent =
      'Falta configurar data-mistik-product o data-api-url en el widget.';
    return;
  }

  const root = element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>${styles}</style><div class="state">Cargando...</div>`;

  try {
    const [productResponse, productsResponse] = await Promise.all([
      fetch(`${apiUrl}/public/projects/${encodeURIComponent(slug)}`),
      fetch(`${apiUrl}/public/projects`),
    ]);

    if (!productResponse.ok) {
      throw new Error(
        productResponse.status === 404
          ? 'Producto no encontrado.'
          : 'No se pudo cargar el producto.',
      );
    }

    if (!productsResponse.ok) {
      throw new Error('No se pudieron cargar los productos relacionados.');
    }

    const product = (await productResponse.json()) as Product;
    const products = (await productsResponse.json()) as Product[];
    const images = uniqueImages(product);
    const related = products.filter((item) => item.id !== product.id).slice(0, 3);

    let imageIndex = 0;
    let selectedSize = product.sizes[0] ?? null;

    root.innerHTML = `
      <style>${styles}</style>
      <article class="product">
        <a class="back" href="${catalogUrl}">Volver a ver todos los productos</a>

        <section class="hero">
          <div class="gallery">
            ${
              images.length
                ? `<img class="gallery__image" src="${images[0].url}" alt="${images[0].alt ?? product.title}">`
                : ''
            }
            ${
              images.length > 1
                ? `
                  <div class="gallery__nav">
                    <button class="gallery__button gallery__button--prev" type="button" aria-label="Foto anterior">‹</button>
                    <button class="gallery__button gallery__button--next" type="button" aria-label="Foto siguiente">›</button>
                  </div>
                `
                : ''
            }
          </div>

          <div class="info">
            <h1>${product.title}</h1>
            ${product.subtitle ? `<p class="subtitle">${product.subtitle}</p>` : ''}

            ${
              product.sizes.length
                ? `
                  <span class="sizes-label">Talle</span>
                  <div class="sizes">
                    ${product.sizes
                      .map(
                        (size, index) => `
                          <button
                            class="size"
                            type="button"
                            data-size="${size}"
                            aria-pressed="${index === 0 ? 'true' : 'false'}"
                          >${size}</button>
                        `,
                      )
                      .join('')}
                  </div>
                `
                : ''
            }

            <div class="buy">
              <p class="price">${product.price === null ? 'Consultar' : money.format(product.price)}</p>
              <button class="add" type="button" ${
                product.price === null ? 'disabled' : ''
              }>Agregar al carrito</button>
              <p class="added" aria-live="polite"></p>
            </div>
          </div>
        </section>

        ${product.description ? `<p class="description">${product.description}</p>` : ''}

        ${
          related.length
            ? `
              <section class="related">
                <h2>Otros productos</h2>
                <div class="related__grid">
                  ${related.map((item) => renderCard(item, productBaseUrl)).join('')}
                </div>
              </section>
            `
            : ''
        }
      </article>
    `;

    const galleryImage = root.querySelector<HTMLImageElement>('.gallery__image');
    const updateImage = () => {
      if (!galleryImage || !images.length) return;
      galleryImage.src = images[imageIndex].url;
      galleryImage.alt = images[imageIndex].alt ?? product.title;
    };

    root
      .querySelector('.gallery__button--prev')
      ?.addEventListener('click', () => {
        imageIndex = (imageIndex - 1 + images.length) % images.length;
        updateImage();
      });

    root
      .querySelector('.gallery__button--next')
      ?.addEventListener('click', () => {
        imageIndex = (imageIndex + 1) % images.length;
        updateImage();
      });

    root.querySelectorAll<HTMLButtonElement>('.size').forEach((button) => {
      button.addEventListener('click', () => {
        selectedSize = Number(button.dataset.size);
        root.querySelectorAll<HTMLButtonElement>('.size').forEach((candidate) => {
          candidate.setAttribute(
            'aria-pressed',
            candidate === button ? 'true' : 'false',
          );
        });
      });
    });

    const added = root.querySelector<HTMLElement>('.added');
    root.querySelector<HTMLButtonElement>('.add')?.addEventListener('click', () => {
      addToCart({
        projectId: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        size: selectedSize,
        quantity: 1,
        imageUrl: product.coverImage?.url ?? images[0]?.url ?? null,
      });

      if (added) {
        added.textContent = 'Agregado al carrito.';
        window.setTimeout(() => {
          added.textContent = '';
        }, 1800);
      }
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No se pudo cargar el producto.';
    root.innerHTML = `<style>${styles}</style><div class="state">${message}</div>`;
  }
}

function mountAll() {
  document
    .querySelectorAll<HTMLElement>('[data-mistik-product]')
    .forEach((element) => void mountProduct(element));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll, { once: true });
} else {
  mountAll();
}

window.addEventListener('mistik:mount-products', mountAll);
