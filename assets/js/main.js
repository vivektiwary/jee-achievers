const testimonials = [
  {
    name: "Ananya Iyer",
    program: "Two-Year Integrated",
    message:
      "The MyJEE analytics dashboard kept my revision laser-focused. My mentor Shruti ma'am ensured I never felt overwhelmed even during peak mocks.",
    year: "2024",
    score: "AIR 186"
  },
  {
    name: "Raghav Sharma",
    program: "Dropper & Target 2024",
    message:
      "Rank Reboot sprints were a game changer. Daily scorecards + night doubt rooms gave me the push to jump from 91 to 99.5 percentile.",
    year: "2024",
    score: "JEE Main 99.52%"
  },
  {
    name: "Sara Khan",
    program: "Foundation Batch",
    message:
      "I loved the STEM labs and Olympiad boosters. The early foundation I built with JEEAchievers makes my class 11 prep super comfortable.",
    year: "2023",
    score: "NTSE Scholar"
  }
];

const STORAGE_KEY = "jeeachievers-testimonials";

function loadStoredTestimonials() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Local storage unavailable", error);
    return [];
  }
}

function persistTestimonials(items) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12)));
  } catch (error) {
    console.warn("Unable to persist testimonials", error);
  }
}

const savedTestimonials = loadStoredTestimonials();
if (savedTestimonials.length) {
  testimonials.push(...savedTestimonials);
}

const sliderContainer = document.querySelector(".testimonial-slider");
const testimonialForm = document.querySelector(".testimonial-form");
const testimonialButtons = document.querySelectorAll("[data-action]");
const reviewButtons = document.querySelectorAll("[data-review-source]");
const reviewList = document.querySelector(".review-list");
const contactForm = document.querySelector(".contact-form");
const newsletterForm = document.querySelector(".newsletter-form");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
const floatingBtn = document.querySelector(".floating-btn");
const floatingPanel = document.getElementById("floating-panel");

const REVIEW_ENDPOINTS = {
  urbanpro: {
    endpoint: "",
    transform: data =>
      (data?.reviews || []).map(review => ({
        author: review.name || "UrbanPro Learner",
        rating: review.rating || 5,
        message: review.comment || "",
        source: "UrbanPro",
        url: review.url || "https://www.urbanpro.com/"
      }))
  },
  google: {
    endpoint: "",
    transform: data =>
      (data?.result?.reviews || data?.reviews || []).map(review => ({
        author: review.author_name || "Google Reviewer",
        rating: review.rating || 5,
        message: review.text || "",
        source: "Google",
        url: review.author_url || "https://maps.google.com"
      }))
  }
};

function renderTestimonials(items) {
  if (!sliderContainer) return;
  sliderContainer.innerHTML = "";
  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "testimonial-card";
    card.innerHTML = `
      <blockquote>“${item.message}”</blockquote>
      <footer>
        <strong>${item.name}</strong>
        <span>${item.program}</span>
        ${item.year ? `<span>Batch ${item.year}</span>` : ""}
        ${item.score ? `<span>${item.score}</span>` : ""}
      </footer>
    `;
    sliderContainer.appendChild(card);
  });
}

function handleTestimonialForm(event) {
  event.preventDefault();
  const formData = new FormData(testimonialForm);
  const newTestimonial = {
    name: formData.get("name").trim(),
    program: formData.get("program").trim(),
    message: formData.get("message").trim(),
    year: formData.get("year").trim(),
    score: formData.get("score").trim()
  };

  if (!newTestimonial.name || !newTestimonial.program || !newTestimonial.message) {
    return;
  }

  testimonials.unshift(newTestimonial);
  persistTestimonials(testimonials);
  renderTestimonials(testimonials);
  testimonialForm.reset();
  alert("Thank you! Your testimonial has been submitted for review.");
}

function scrollSlider(direction) {
  if (!sliderContainer) return;
  const cardWidth = sliderContainer.querySelector(".testimonial-card")?.offsetWidth || 320;
  sliderContainer.scrollBy({
    left: direction === "next" ? cardWidth + 24 : -(cardWidth + 24),
    behavior: "smooth"
  });
}

testimonialButtons.forEach(button => {
  button.addEventListener("click", () => scrollSlider(button.dataset.action));
});

if (testimonialForm) {
  testimonialForm.addEventListener("submit", handleTestimonialForm);
}

function renderReviews(reviews) {
  if (!reviewList) return;
  reviewList.innerHTML = "";
  if (!reviews.length) {
    reviewList.innerHTML = `<p class="form-note">No reviews fetched. Configure your API endpoint or add testimonials manually.</p>`;
    return;
  }

  reviews.forEach(review => {
    const card = document.createElement("article");
    card.className = "review-card";
    const ratingStars = "★".repeat(Math.round(review.rating || 5));
    card.innerHTML = `
      <header>
        <span>${review.author}</span>
        <span class="rating" aria-label="${review.rating} star rating">${ratingStars}</span>
      </header>
      <p>${review.message || ""}</p>
      <a class="form-note" href="${review.url}" target="_blank" rel="noopener">View on ${review.source}</a>
    `;
    reviewList.appendChild(card);
  });
}

async function fetchReviews(source) {
  if (!reviewList) return;
  reviewList.innerHTML = `<p class="form-note">Fetching ${source} reviews…</p>`;
  const config = (window.reviewConfig && window.reviewConfig[source]) || REVIEW_ENDPOINTS[source];

  if (!config || !config.endpoint) {
    reviewList.innerHTML = `<p class="form-note">Add your ${source} reviews API endpoint in <code>assets/js/main.js</code> under REVIEW_ENDPOINTS to enable live syncing.</p>`;
    return;
  }

  try {
    const response = await fetch(config.endpoint);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    const reviews = (config.transform && config.transform(data)) || [];
    renderReviews(reviews);
  } catch (error) {
    console.error(error);
    reviewList.innerHTML = `<p class="form-note">Unable to fetch ${source} reviews right now. Please verify your API key or enable CORS on the endpoint.</p>`;
  }
}

reviewButtons.forEach(button => {
  button.addEventListener("click", () => fetchReviews(button.dataset.reviewSource));
});

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  console.table(payload);
  form.reset();
  alert("Thank you! Our counselors will reach out shortly.");
}

if (contactForm) {
  contactForm.addEventListener("submit", handleFormSubmit);
}

if (newsletterForm) {
  newsletterForm.addEventListener("submit", handleFormSubmit);
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });
}

if (floatingBtn && floatingPanel) {
  floatingBtn.addEventListener("click", () => {
    const expanded = floatingBtn.getAttribute("aria-expanded") === "true";
    floatingBtn.setAttribute("aria-expanded", String(!expanded));
    floatingPanel.classList.toggle("is-visible");
  });
}

const currentYearEl = document.getElementById("current-year");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

renderTestimonials(testimonials);
renderReviews([]);
