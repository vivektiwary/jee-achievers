const testimonials = [
  {
    name: "Saroja Nair",
    program: "Entrance Coaching",
    message:
      "He is a fantastic teacher who genuinely wants students to excel. His way of teaching is very friendly and the concepts can be easily grasped by children. I would give a 10 on 10 to his approach.",
    year: "2025",
    score: "10/10 Rating"
  },
  {
    name: "Sourabh Dahiya",
    program: "Engineering Entrance Coaching",
    message:
      "Gunjan Kumar has been an exceptional teacher... Combined with his patient and motivating teaching style, it made a significant difference. My son successfully cleared NIMCET exam and got placed in NIT Patna.",
    year: "2024",
    score: "Placed in NIT Patna"
  },
  {
    name: "Vishakha Sharma",
    program: "JEE Mains/Advanced",
    message:
      "My subject knowledge in Maths has improved from basic upto advanced level. There is no scarcity of content and practice modules. His guidance is worth every penny and time.",
    year: "2024",
    score: "Advanced Level Support"
  },
  {
    name: "Jonathan",
    program: "Maths Tuition",
    message:
      "Initially I was unable to solve mains level module or PYQs but now I'm able to solve advanced level as well. He does quality mains/advanced PYQs in class and helps you solve questions if you're stuck.",
    year: "2024",
    score: "Zero to Advanced"
  },
  {
    name: "Rashmi Bhardwaj",
    program: "Parent Review",
    message:
      "My son is taking classes from Gunjan Sir. His teaching methodology is really good. He makes the concepts easily understandable by giving relatable examples.",
    year: "2024",
    score: "Verified Parent"
  },
  {
    name: "Anjali",
    program: "Engineering Entrance",
    message:
      "You have a remarkable ability to make complex topics understandable. Your clear explanations have made a significant impact on my learning. Thank you so much sir for helping me through the process.",
    year: "2024",
    score: "Student"
  },
  {
    name: "Kumari Mona Bharti",
    program: "Class 12 Tuition",
    message:
      "He is a good teacher, teaches very well and understands. Have been teaching for 2 years. My child is progressing in studies.",
    year: "2024",
    score: "Parent Review"
  },
  {
    name: "Nithin",
    program: "Engineering Entrance",
    message:
      "Very nice coaching satisfied with the teaching and the method used I was able to increase my marks after attending this coaching.",
    year: "2023",
    score: "Marks Improved"
  },
  {
    name: "Aditya",
    program: "Engineering Entrance",
    message:
      "Sir is a great teacher, he teaches the concept slowly and gives many problems to practice so that I understand the concept better. He also clarifies my doubts quite well.",
    year: "2023",
    score: "Concept Clarity"
  },
  {
    name: "Bhuvan Prakash",
    program: "JEE & SAT Prep",
    message:
      "Gunjan sir is very friendly and very informative, I can very easily interact with him about my problems. Definitely recommended for people who are preparing for any ISC or competitive exams such as JEE and SAT.",
    year: "2023",
    score: "Recommended"
  },
  {
    name: "Sampreeth",
    program: "Engineering Entrance",
    message:
      "Gunjan sir teaches very well and makes sure that the concept is understood. Gives multiple questions to solve and clarifies all the doubts and gives constructive feedback.",
    year: "2023",
    score: "Student"
  },
  {
    name: "Rashmi",
    program: "Engineering Entrance",
    message:
      "The basic concepts are taught well. Also you get clarification on certain concepts. The classes are also interesting. Thank you so much for your support. Highly recommended to all.",
    year: "2022",
    score: "Highly Recommended"
  },
  {
    name: "Niranjan",
    program: "Engineering Entrance",
    message:
      "Gunjan Sir is a great teacher. He explains concepts well with examples and gives many questions to solve. His notes have also been very useful.",
    year: "2022",
    score: "Student"
  },
  {
    name: "M. Thirshith srivanth",
    program: "Engineering Entrance",
    message:
      "I am able to understand and I'm getting my concepts cleared. Will work hard and try to finish my work faster. Thank you.",
    year: "2022",
    score: "Concept Clarity"
  },
  {
    name: "Meenakshi Sarath",
    program: "Engineering Entrance",
    message:
      "Gunjan Sir's teaching really helps me understand my concepts better. He is neither too slow nor too fast... I can see how much I have improved since I initially began these classes.",
    year: "2022",
    score: "Student"
  },
  {
    name: "Gautham",
    program: "Class 12 Tuition",
    message:
      "Sir knows his concepts really well. He gives good notes covering the whole syllabus. He gives practice questions to solve at the end of the class sometimes.",
    year: "2022",
    score: "Good Notes"
  },
  {
    name: "A Chanda",
    program: "Engineering Entrance",
    message:
      "I have started Maths tuition with Gunjan sir for past 1 month. He is teaching methodically and explaining basic concepts which is helpful for my understanding.",
    year: "2022",
    score: "Methodical Teaching"
  },
  {
    name: "Vansh Verma",
    program: "Engineering Entrance",
    message:
      "Gunjan Sir teaches amazing, he makes the concepts easier and clear, he focuses on problem solving as well. One of the best math teachers I've ever had.",
    year: "2021",
    score: "Best Teacher"
  },
  {
    name: "Siddhanth",
    program: "Engineering Entrance",
    message:
      "Amazing teacher. sir knows his subject very well/teaches with lot of passion... Explains concepts extremely well and does very good question practice. Would highly recommend!",
    year: "2021",
    score: "Highly Recommend"
  },
  {
    name: "Khushboo Sharma",
    program: "Engineering Entrance",
    message:
      "Many many thanks to Gunjan Sir... The way you explain concepts makes it very easy to understand and implement... I strongly recommend him.",
    year: "2021",
    score: "Strongly Recommend"
  },
  {
    name: "Atharva Gandhi",
    program: "Engineering Entrance",
    message:
      "He is an excellent teacher... Gunjan sir though teaches for JEE -IIT. He explain topic in a good way and give lots of practice questions to do in class.",
    year: "2021",
    score: "JEE Specialist"
  },
  {
    name: "K Sreekar",
    program: "Engineering Entrance",
    message:
      "He explains very well... He makes you do numerous questions until you master the topic. He is very affable and clarifies all the doubts. I totally recommend him.",
    year: "2021",
    score: "Subject Mastery"
  },
  {
    name: "Mahendra Gupta",
    program: "Engineering Entrance",
    message:
      "1) Very good teaching who works on concepts. 2) Provides lot of practice questions and reference material. ...Has good grip in the concept.",
    year: "2021",
    score: "Concept Grip"
  },
  {
    name: "Grishma",
    program: "Engineering Entrance",
    message:
      "He is a really good amazing teacher, filled with content... I could score 45 marks in mains exam with just 2 months of coaching from him, Allen dint benefit me much, if you need for JEE he is the right person.",
    year: "2020",
    score: "Marks Boost"
  },
  {
    name: "Geetesh Saravanan",
    program: "Engineering Entrance",
    message:
      "Amazing teacher, really talented... he will teach you from scratch till everything... in 3 months with his teaching I could score 40 marks in my jee Jan attempt.",
    year: "2020",
    score: "JEE Jan Attempt"
  },
  {
    name: "Suman Kumari",
    program: "Engineering Entrance",
    message:
      "He is really very nice. He has lots of experience and knowledge. He is very good teacher from entrance point of view.",
    year: "2020",
    score: "Parent Review"
  },
  {
    name: "Dr Sangeeta Padhi",
    program: "Engineering Entrance",
    message:
      "He is a very good, caring, knowledgeable and motivational teacher with deep Maths subject knowledge... Highly recommended as totally worth your time and money.",
    year: "2020",
    score: "Highly Recommended"
  },
  {
    name: "Liza Gogoi",
    program: "Class 12 Tuition",
    message:
      "He is a good teacher that can explain concepts well. He has good knowledge and grasp of mathematics.",
    year: "2020",
    score: "Student"
  },
  {
    name: "Ishan Basu",
    program: "Engineering Entrance",
    message:
      "Gunjan sir teaches all the concepts in a very detailed and logical manner. He is very patient while teaching and answers each and every small doubt.",
    year: "2020",
    score: "Student"
  },
  {
    name: "Rajeev Radhakrishnan",
    program: "Engineering Entrance",
    message:
      "Gunjan sir is a great teacher. He explains concepts well and answer any doubts that I have. He gives various examples for better understanding which really helps.",
    year: "2020",
    score: "Student"
  },
  {
    name: "Shreya",
    program: "Engineering Entrance",
    message:
      "Great questions and helps in conceptually building every chapter. Available for clearing doubts over phone most of the times.",
    year: "2020",
    score: "Student"
  }
];

const STORAGE_KEY = "jeepinnacle-testimonials";

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
const contactForm = document.querySelector(".contact-form");
const newsletterForm = document.querySelector(".newsletter-form");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");
const floatingBtn = document.querySelector(".floating-btn");
const floatingPanel = document.getElementById("floating-panel");
const WHATSAPP_BUSINESS_NUMBER = "918310906345";
const INQUIRY_EMAIL = "hello@jeepinnacle.com";

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

function formatContactInquiry(form) {
  const formData = new FormData(form);
  const batches = formData.getAll("batch");
  const lines = [
    "New JEEPinnacle inquiry",
    "",
    `Student: ${formData.get("student") || "Not provided"}`,
    `Parent contact: ${formData.get("phone") || "Not provided"}`,
    `Email: ${formData.get("email") || "Not provided"}`,
    `Current class: ${formData.get("class") || "Not provided"}`,
    `Preferred batch: ${batches.length ? batches.join(", ") : "Not provided"}`,
    `Message: ${formData.get("message") || "Not provided"}`
  ];

  return lines.join("\n");
}

function encodeFormData(form) {
  const formData = new FormData(form);
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    params.append(key, value);
  });
  return params;
}

function storeNetlifySubmission(form) {
  if (!form.matches("[data-netlify='true']")) return;

  const body = encodeFormData(form).toString();
  if (navigator.sendBeacon) {
    const payload = new Blob([body], { type: "application/x-www-form-urlencoded" });
    if (navigator.sendBeacon("/", payload)) return;
  }

  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    keepalive: true
  }).catch(error => {
    console.warn("Unable to store form submission", error);
  });
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 760px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function openWhatsAppInquiry(form) {
  const message = encodeURIComponent(formatContactInquiry(form));
  const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${message}`;
  window.open(whatsappUrl, "_blank", "noopener");
}

function openEmailInquiry(form) {
  const subject = encodeURIComponent("New JEEPinnacle inquiry");
  const body = encodeURIComponent(formatContactInquiry(form));
  window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${subject}&body=${body}`;
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

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;

  if (form === contactForm) {
    storeNetlifySubmission(form);
    if (isMobileViewport()) {
      openWhatsAppInquiry(form);
      alert("Your inquiry is ready in WhatsApp Business. Please tap send to submit it.");
    } else {
      openEmailInquiry(form);
      alert("An email draft has been prepared with your inquiry details. Please send it from your email app.");
    }
    form.reset();
    return;
  }

  storeNetlifySubmission(form);
  form.reset();
  alert("Thank you! You will receive JEE strategies at this email.");
}

if (contactForm) {
  contactForm.addEventListener("submit", handleFormSubmit);
}

if (newsletterForm) {
  newsletterForm.addEventListener("submit", handleFormSubmit);
}

if (navToggle && siteNav) {
  const closeSiteNav = () => {
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  };

  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open", !expanded);
  });

  siteNav.addEventListener("click", event => {
    if (event.target.closest("a")) closeSiteNav();
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeSiteNav();
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
