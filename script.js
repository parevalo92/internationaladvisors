// HEADER SCROLL
const header = document.getElementById("header");

if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });
}

// MOBILE MENU
const menuOpenButton = document.getElementById("menu-open-button");
const menuCloseButton = document.getElementById("menu-close-button");
const navMenu = document.getElementById("nav-menu");

if (menuOpenButton && menuCloseButton && navMenu) {
  menuOpenButton.addEventListener("click", () => {
    navMenu.classList.add("active");
  });

  menuCloseButton.addEventListener("click", () => {
    navMenu.classList.remove("active");
  });

  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => navMenu.classList.remove("active"));
  });
}

// REVEAL ON SCROLL
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(el => revealObserver.observe(el));

// COUNTERS
const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const counter = entry.target;
    const target = +counter.dataset.target;
    let count = 0;
    const increment = Math.max(1, Math.ceil(target / 50));

    const updateCounter = () => {
      count += increment;

      if (count >= target) {
        counter.textContent = target + (target === 100 ? "%" : "+");
      } else {
        counter.textContent = count;
        requestAnimationFrame(updateCounter);
      }
    };

    updateCounter();
    counterObserver.unobserve(counter);
  });
}, { threshold: 0.6 });

counters.forEach(counter => counterObserver.observe(counter));

// CURSOR GLOW
const cursorGlow = document.querySelector(".cursor-glow");

if (cursorGlow) {
  window.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });
}

// MAGNETIC BUTTONS
document.querySelectorAll(".magnetic").forEach(button => {
  button.addEventListener("mousemove", (e) => {
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0, 0)";
  });
});

// TILT CARD
document.querySelectorAll(".tilt-card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = ((y / rect.height) - 0.5) * -10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
  });
});

// SIMPLE I18N
const languageButtons = document.querySelectorAll("[data-language]");

function getBasePath() {
  return window.location.pathname.includes("/blog/") ? "../" : "";
}

async function changeLanguage(lang) {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}data/${lang}.json`);
    const texts = await response.json();

    document.documentElement.lang = lang;

    document.querySelectorAll("[data-section][data-value]").forEach(el => {
      const section = el.dataset.section;
      const value = el.dataset.value;

      if (texts[section] && texts[section][value]) {
        if (el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", texts[section][value]);
        } else {
          el.textContent = texts[section][value];
        }
      }
    });

    languageButtons.forEach(btn => btn.classList.remove("active"));
    document.querySelector(`[data-language="${lang}"]`)?.classList.add("active");

    localStorage.setItem("language", lang);

    loadBlogPosts();
    loadHomePosts();
    loadSinglePost();
  } catch (error) {
    console.error("Error loading language file:", error);
  }
  
}

languageButtons.forEach(button => {
  button.addEventListener("click", () => {
    const lang = button.dataset.language;
    changeLanguage(lang);
  });
});

// BLOG LIST
async function getPosts() {
  const basePath = getBasePath();
  const postsPath = window.location.pathname.includes("/blog/")
    ? "./posts.json"
    : "blog/posts.json";

  const response = await fetch(postsPath);
  return await response.json();
}

async function loadBlogPosts() {
  const blogList = document.getElementById("blog-list");
  if (!blogList) return;

  const currentLang = localStorage.getItem("language") || "es";

  try {
    const posts = await getPosts();

    if (!posts.length) {
      blogList.innerHTML = `
        <article class="blog-card glass">
          <div class="blog-card-content">
            <span class="blog-tag">${currentLang === "es" ? "Vacío por ahora" : "Empty for now"}</span>
            <h3>${currentLang === "es" ? "No hay artículos publicados todavía" : "No articles published yet"}</h3>
            <p>${currentLang === "es"
              ? "Cuando agregues posts en blog/posts.json, aparecerán aquí automáticamente."
              : "Once you add posts in blog/posts.json, they will appear here automatically."}
            </p>
          </div>
        </article>
      `;
      return;
    }

    blogList.innerHTML = posts.map(post => `
      <article class="blog-card glass reveal visible">
        <img src="${post.image}" alt="${post.title[currentLang]}">
        <div class="blog-card-content">
          <span class="blog-tag">${post.category[currentLang]}</span>
          <h3>${post.title[currentLang]}</h3>
          <p>${post.excerpt[currentLang]}</p>
          <a class="text-link" href="blog/single.html?slug=${post.slug}">
            ${currentLang === "es" ? "Leer más" : "Read more"}
          </a>
        </div>
      </article>
    `).join("");
  } catch (error) {
    blogList.innerHTML = `
      <article class="blog-card glass">
        <div class="blog-card-content">
          <span class="blog-tag">Error</span>
          <h3>${currentLang === "es" ? "No se pudo cargar el blog" : "Could not load the blog"}</h3>
        </div>
      </article>
    `;
  }
}

// HOME BLOG PREVIEW
async function loadHomePosts() {
  const homeBlogList = document.getElementById("home-blog-list");
  if (!homeBlogList) return;

  const currentLang = localStorage.getItem("language") || "es";

  try {
    const posts = await getPosts();
    const latestPosts = posts.slice(0, 2);

    if (!latestPosts.length) {
      homeBlogList.innerHTML = `
        <article class="blog-card glass reveal visible">
          <div class="blog-card-content">
            <span class="blog-tag">Blog</span>
            <h3>${currentLang === "es" ? "Espacio listo para tus publicaciones" : "Ready for your posts"}</h3>
            <p>${currentLang === "es" ? "Agrega tus artículos en blog/posts.json." : "Add your articles in blog/posts.json."}</p>
            <a href="blog.html" class="text-link">${currentLang === "es" ? "Ir al blog" : "Go to blog"}</a>
          </div>
        </article>
      `;
      return;
    }

    homeBlogList.innerHTML = latestPosts.map(post => `
      <article class="blog-card glass reveal visible">
        <img src="${post.image}" alt="${post.title[currentLang]}">
        <div class="blog-card-content">
          <span class="blog-tag">${post.category[currentLang]}</span>
          <h3>${post.title[currentLang]}</h3>
          <p>${post.excerpt[currentLang]}</p>
          <a class="text-link" href="blog/single.html?slug=${post.slug}">
            ${currentLang === "es" ? "Leer más" : "Read more"}
          </a>
        </div>
      </article>
    `).join("");
  } catch (error) {
    console.error("Error loading home posts:", error);
  }
}

// SINGLE POST
async function loadSinglePost() {
  const container = document.getElementById("post-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const currentLang = localStorage.getItem("language") || "es";

  try {
    const posts = await getPosts();
    const post = posts.find(item => item.slug === slug);

    if (!post) {
      container.innerHTML = `
        <div class="blog-card-content">
          <span class="blog-tag">${currentLang === "es" ? "No encontrado" : "Not found"}</span>
          <h1 class="section-title">${currentLang === "es" ? "Artículo no encontrado" : "Article not found"}</h1>
          <p class="section-text">${currentLang === "es" ? "Revisa el slug o agrega el contenido en blog/posts.json." : "Check the slug or add the content in blog/posts.json."}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <img src="../${post.image}" alt="${post.title[currentLang]}">
      <div class="blog-card-content">
        <span class="blog-tag">${post.category[currentLang]}</span>
        <h1 class="section-title">${post.title[currentLang]}</h1>
        <p class="section-text">${post.date}</p>
        <div class="post-body">${post.content[currentLang]}</div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <div class="blog-card-content">
        <span class="blog-tag">Error</span>
        <h1 class="section-title">${currentLang === "es" ? "No se pudo cargar el artículo" : "Could not load the article"}</h1>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLanguage = localStorage.getItem("language") || "es";
  changeLanguage(savedLanguage);
});

