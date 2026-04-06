const CONTACT = {
  whatsappNumber: '91XXXXXXXXXX',
  callNumber: '+91XXXXXXXXXX',
};

let videoSlider = null;
let videoCardCount = 0;

function isConfiguredContact(value, minDigits = 10) {
  return typeof value === 'string' && !/[xX]/.test(value) && value.replace(/\D/g, '').length >= minDigits;
}

function cleanNumber(value) {
  return (value || '').replace(/\D/g, '');
}

function buildWhatsAppUrl(message) {
  if (!isConfiguredContact(CONTACT.whatsappNumber)) {
    return '';
  }

  return `https://wa.me/${cleanNumber(CONTACT.whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

function openExternalUrl(url) {
  if (!url) {
    return false;
  }

  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.location.href = url;
  }

  return true;
}

function showContactSetupMessage(channel) {
  const label = channel === 'call' ? 'call number' : 'WhatsApp number';
  alert(`Please set your real ${label} in script.js before using this feature.`);
}

function initFadeInObserver() {
  const fadeItems = document.querySelectorAll('.fi');
  if (!fadeItems.length) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    fadeItems.forEach((item) => item.classList.add('on'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('on');
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.06 });

  fadeItems.forEach((item) => observer.observe(item));
}

function initCountdown() {
  const countdown = document.getElementById('countdown');
  if (!countdown) {
    return;
  }

  let totalSeconds = (4 * 3600) + (30 * 60);

  function tick() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    countdown.textContent = [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0'),
    ].join(':');

    totalSeconds -= 1;
    if (totalSeconds < 0) {
      totalSeconds = (4 * 3600) + (30 * 60);
    }
  }

  tick();
  window.setInterval(tick, 1000);
}

function initNavState() {
  const nav = document.querySelector('.topnav');
  if (!nav) {
    return;
  }

  const syncNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };

  syncNav();
  window.addEventListener('scroll', syncNav, { passive: true });
}

function faq(element) {
  if (!element || !element.nextElementSibling) {
    return;
  }

  const answer = element.nextElementSibling;
  const alreadyOpen = answer.classList.contains('show');

  document.querySelectorAll('.faq-a').forEach((item) => item.classList.remove('show'));
  document.querySelectorAll('.faq-q').forEach((item) => item.classList.remove('open'));

  if (!alreadyOpen) {
    answer.classList.add('show');
    element.classList.add('open');
  }
}

function animateCount(id, target, suffix = '', duration = 1500) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const currentValue = Math.floor(progress * target);
    element.textContent = `${currentValue.toLocaleString('en-IN')}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function initCounters() {
  const counterSection = document.getElementById('s-counter');
  if (!counterSection) {
    return;
  }

  let hasAnimated = false;

  function startAnimation() {
    if (hasAnimated) {
      return;
    }

    hasAnimated = true;
    animateCount('c1', 5000, '+', 2000);
    animateCount('c2', 98, '%', 1500);
    animateCount('c3', 15, '+', 1500);
    animateCount('c4', 8, '', 1200);
  }

  if (!('IntersectionObserver' in window)) {
    startAnimation();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0] || !entries[0].isIntersecting) {
      return;
    }

    startAnimation();
    observer.disconnect();
  }, { threshold: 0.3 });

  observer.observe(counterSection);
}

function getSliderStepSize() {
  if (!videoSlider) {
    return 0;
  }

  const firstCard = videoSlider.querySelector('.vid-card');
  if (!firstCard) {
    return 0;
  }

  const styles = window.getComputedStyle(videoSlider);
  const gap = parseFloat(styles.columnGap || styles.gap || '0');

  return firstCard.getBoundingClientRect().width + gap;
}

function updateVideoDots() {
  const dots = document.querySelectorAll('#vidDots .vdot');
  if (!videoSlider || !dots.length) {
    return;
  }

  const stepSize = getSliderStepSize();
  if (!stepSize) {
    return;
  }

  const activeIndex = Math.max(0, Math.min(
    videoCardCount - 1,
    Math.round(videoSlider.scrollLeft / stepSize),
  ));

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function scrollToVid(index) {
  if (!videoSlider) {
    return;
  }

  const stepSize = getSliderStepSize();
  if (!stepSize) {
    return;
  }

  const safeIndex = Math.max(0, Math.min(index, videoCardCount - 1));
  videoSlider.scrollTo({
    left: safeIndex * stepSize,
    behavior: 'smooth',
  });
}

function initVideoSlider() {
  videoSlider = document.getElementById('vidSlider');
  const dotsRoot = document.getElementById('vidDots');

  if (!videoSlider || !dotsRoot) {
    return;
  }

  const cards = Array.from(videoSlider.querySelectorAll('.vid-card'));
  videoCardCount = cards.length;

  dotsRoot.innerHTML = '';

  cards.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = index === 0 ? 'vdot active' : 'vdot';
    dot.setAttribute('aria-label', `Go to video ${index + 1}`);
    dot.addEventListener('click', () => scrollToVid(index));
    dotsRoot.appendChild(dot);
  });

  videoSlider.addEventListener('scroll', updateVideoDots, { passive: true });
  window.addEventListener('resize', updateVideoDots);
  updateVideoDots();
}

function playVideo(_thumb, id) {
  const url = buildWhatsAppUrl(`Mujhe ${id} video dekhna hai / Video ${id} testimonial`);

  if (!url) {
    showContactSetupMessage('whatsapp');
    return;
  }

  openExternalUrl(url);
}

function getFieldValue(id) {
  const field = document.getElementById(id);
  return field ? field.value.trim() : '';
}

function getSelectText(id) {
  const field = document.getElementById(id);
  if (!field || field.selectedIndex < 0) {
    return '';
  }

  return field.options[field.selectedIndex].text.trim();
}

function submitOrder() {
  const name = getFieldValue('f-name');
  const phone = getFieldValue('f-phone');
  const address = getFieldValue('f-address');
  const productValue = getFieldValue('f-product');

  if (!name || !phone || !address || !productValue) {
    alert('Please fill all required fields marked with *.');
    return;
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 7) {
    alert('Please enter a valid mobile number.');
    return;
  }

  const wa = getFieldValue('f-wa');
  const size = getFieldValue('f-size');
  const message = getFieldValue('f-msg');

  const orderLines = [
    'RN Herbal - New Order',
    '',
    `Name: ${name}`,
    `Mobile: ${phone}`,
  ];

  if (wa) {
    orderLines.push(`WhatsApp: ${wa}`);
  }

  orderLines.push(`Product: ${getSelectText('f-product')}`);
  orderLines.push(`Stone Type: ${getSelectText('f-type') || 'Not shared'}`);
  orderLines.push(`Size: ${size || 'Not shared'}`);
  orderLines.push(`Address: ${address}`);
  orderLines.push(`Country: ${getSelectText('f-country')}`);
  orderLines.push(`Payment: ${getSelectText('f-payment')}`);

  if (message) {
    orderLines.push(`Message: ${message}`);
  }

  orderLines.push('');
  orderLines.push('Please confirm order and delivery time.');

  const url = buildWhatsAppUrl(orderLines.join('\n'));
  if (!url) {
    showContactSetupMessage('whatsapp');
    return;
  }

  openExternalUrl(url);

  const successBox = document.getElementById('formSuccess');
  if (successBox) {
    successBox.style.display = 'block';
  }

  const orderForm = document.getElementById('orderForm');
  if (orderForm && typeof orderForm.scrollIntoView === 'function') {
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

function fallbackCopyText(text) {
  const tempInput = document.createElement('input');
  tempInput.type = 'text';
  tempInput.value = text;
  tempInput.setAttribute('readonly', '');
  tempInput.style.position = 'absolute';
  tempInput.style.left = '-9999px';

  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, text.length);

  try {
    document.execCommand('copy');
    alert('Link copied successfully.');
  } catch (error) {
    window.prompt('Copy this link:', text);
  }

  tempInput.remove();
}

function copyLink(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const url = window.location.href;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Link copied successfully.');
      })
      .catch(() => {
        fallbackCopyText(url);
      });
    return;
  }

  fallbackCopyText(url);
}

function initShareLinks() {
  const currentPageUrl = window.location.href;
  const whatsappShareLink = document.getElementById('shareWaLink');
  const facebookShareLink = document.getElementById('shareFbLink');
  const shareMessage = 'Pathri ka Ayurvedic ilaaj - bina operation ke! RN Herbal Stone-Go Capsule. Abhi dekhein:';

  if (whatsappShareLink) {
    whatsappShareLink.href = `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n${currentPageUrl}`)}`;
  }

  if (facebookShareLink) {
    facebookShareLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentPageUrl)}`;
  }
}

function initContactLinks() {
  const ctaWaLink = document.getElementById('ctaWaLink');
  const ctaCallLink = document.getElementById('ctaCallLink');
  const footerWhatsappText = document.getElementById('footerWhatsappText');

  if (ctaWaLink) {
    const waUrl = buildWhatsAppUrl('Mujhe Stone-Go Combo chahiye');
    if (waUrl) {
      ctaWaLink.href = waUrl;
      ctaWaLink.target = '_blank';
      ctaWaLink.rel = 'noopener noreferrer';
    } else {
      ctaWaLink.href = '#s-form';
      ctaWaLink.title = 'Set your WhatsApp number in script.js to enable direct chat.';
    }
  }

  if (ctaCallLink) {
    if (isConfiguredContact(CONTACT.callNumber)) {
      ctaCallLink.href = `tel:${cleanNumber(CONTACT.callNumber)}`;
    } else {
      ctaCallLink.href = '#s-form';
      ctaCallLink.title = 'Set your call number in script.js to enable direct calling.';
    }
  }

  if (footerWhatsappText && isConfiguredContact(CONTACT.whatsappNumber)) {
    footerWhatsappText.textContent = CONTACT.whatsappNumber;
  }
}

function init() {
  initNavState();
  initFadeInObserver();
  initCountdown();
  initCounters();
  initVideoSlider();
  initShareLinks();
  initContactLinks();
}

init();
