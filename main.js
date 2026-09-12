/**
 * WEB X CAFE - Interactive Frame Animation & Cyber Fuel Showcase Engine
 * Total Frames: 270 (ezgif-frame-001.jpg to ezgif-frame-270.jpg)
 */

const TOTAL_FRAMES = 270;
const FRAME_PATH_PREFIX = '/frames/ezgif-frame-';
const FRAME_PATH_SUFFIX = '.jpg';

// State Management
const state = {
  images: [],
  loadedFrames: 0,
  currentFrame: 1,
  targetFrame: 1,
  isPlaying: false,
  playSpeed: 1,
  isAudioPlaying: false,
  audioCtx: null,
  gainNode: null,
  selectedFlavor: 'Rich Chocolate',
  selectedWeight: '2 kg (4.4 lb)',
  selectedPrice: '4499',
};

// DOM Elements
const canvas = document.getElementById('scroll-canvas');
const ctx = canvas.getContext('2d');
const preloader = document.getElementById('preloader');
const progressBar = document.getElementById('progress-bar');
const loaderPercentage = document.getElementById('loader-percentage');
const loaderFrames = document.getElementById('loader-frames');

const frameScrubber = document.getElementById('frame-scrubber');
const currentFrameText = document.getElementById('current-frame-text');
const scrollPercentText = document.getElementById('scroll-percent-text');

const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');
const speedBtn = document.getElementById('speed-btn');

const storySections = document.querySelectorAll('.story-section');
const menuModal = document.getElementById('menu-modal');
const openMenuBtn = document.getElementById('open-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const ctaMenuBtn = document.getElementById('cta-menu-btn');
const ctaTourBtn = document.getElementById('cta-tour-btn');

const reserveBtn = document.getElementById('reserve-btn');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');

const audioToggle = document.getElementById('audio-toggle');
const audioIconOff = document.getElementById('audio-icon-off');
const audioIconOn = document.getElementById('audio-icon-on');

/**
 * Format frame index with 3-digit padding (1 -> "001")
 */
function getFrameFilename(index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${FRAME_PATH_PREFIX}${paddedIndex}${FRAME_PATH_SUFFIX}`;
}

/**
 * Preload all 270 image frames into memory
 */
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameFilename(i);
      
      img.onload = () => {
        state.loadedFrames++;
        const percent = Math.floor((state.loadedFrames / TOTAL_FRAMES) * 100);
        
        progressBar.style.width = `${percent}%`;
        loaderPercentage.innerText = `${percent}%`;
        loaderFrames.innerText = `${state.loadedFrames} / ${TOTAL_FRAMES} FRAMES PRELOADED`;

        if (state.loadedFrames === TOTAL_FRAMES) {
          setTimeout(() => {
            preloader.classList.add('hidden');
            resolve();
          }, 300);
        }
      };

      img.onerror = () => {
        state.loadedFrames++;
        if (state.loadedFrames === TOTAL_FRAMES) {
          preloader.classList.add('hidden');
          resolve();
        }
      };

      state.images.push(img);
    }
  });
}

/**
 * Resize Canvas to fit screen with crisp resolution
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  renderFrame(Math.round(state.currentFrame));
}

/**
 * Draw frame on canvas with aspect ratio cover logic
 */
function renderFrame(frameIndex) {
  const imgIndex = Math.min(Math.max(frameIndex - 1, 0), TOTAL_FRAMES - 1);
  const img = state.images[imgIndex];
  
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const x = (canvasWidth - img.width * scale) / 2;
  const y = (canvasHeight - img.height * scale) / 2;

  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
}

/**
 * Lerp Animation Loop
 */
function animate() {
  if (!state.isPlaying) {
    const diff = state.targetFrame - state.currentFrame;
    if (Math.abs(diff) > 0.01) {
      state.currentFrame += diff * 0.12;
      renderFrame(Math.round(state.currentFrame));
      updateUI();
    }
  } else {
    state.currentFrame += 0.4 * state.playSpeed;
    if (state.currentFrame > TOTAL_FRAMES) {
      state.currentFrame = 1;
    }
    state.targetFrame = state.currentFrame;
    renderFrame(Math.round(state.currentFrame));
    updateUI();
  }

  requestAnimationFrame(animate);
}

/**
 * Calculate Target Frame based on window scroll position
 */
function onScroll() {
  if (state.isPlaying) return;

  const scrollWrapper = document.getElementById('scroll-wrapper');
  const maxScroll = scrollWrapper.clientHeight - window.innerHeight;
  const currentScroll = Math.max(0, window.scrollY);
  const progress = Math.min(Math.max(currentScroll / maxScroll, 0), 1);

  state.targetFrame = 1 + progress * (TOTAL_FRAMES - 1);

  updateStorySections(progress);
}

/**
 * Update UI Indicators & Scrubber Position
 */
function updateUI() {
  const roundedFrame = Math.round(state.currentFrame);
  if (frameScrubber) frameScrubber.value = roundedFrame;
  if (currentFrameText) currentFrameText.innerText = `FRAME ${String(roundedFrame).padStart(3, '0')} / ${TOTAL_FRAMES}`;
  
  const percent = Math.floor((roundedFrame / TOTAL_FRAMES) * 100);
  if (scrollPercentText) scrollPercentText.innerText = `${percent}%`;
}

/**
 * Synchronize Active Story Cards based on scroll progress
 */
function updateStorySections(progress) {
  storySections.forEach((section, index) => {
    const step = 1 / storySections.length;
    const start = index * step;
    const end = (index + 1) * step;

    if (progress >= start && progress < end) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}

/**
 * Toggle Auto-Play Demo Mode
 */
function togglePlayPause() {
  state.isPlaying = !state.isPlaying;

  if (state.isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    showToast("Auto-play cinematic mode active");
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  }
}

/**
 * Cycle Playback Speed
 */
function cycleSpeed() {
  const speeds = [1.0, 1.5, 2.0];
  const nextIdx = (speeds.indexOf(state.playSpeed) + 1) % speeds.length;
  state.playSpeed = speeds[nextIdx];
  speedBtn.innerText = `${state.playSpeed.toFixed(1)}x`;
}

/**
 * Scrubber manual input
 */
function onScrubberInput(e) {
  state.isPlaying = false;
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');

  const val = parseInt(e.target.value, 10);
  state.targetFrame = val;
  state.currentFrame = val;
  renderFrame(val);
  updateUI();
}

/**
 * Web Audio Synthesizer for Ambient Cafe Drone
 */
function toggleAmbientAudio() {
  if (!state.audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioCtx();
  }

  if (state.audioCtx.state === 'suspended') {
    state.audioCtx.resume();
  }

  if (!state.isAudioPlaying) {
    const freqs = [110, 164.81, 196.00, 246.94];
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.setValueAtTime(0.08, state.audioCtx.currentTime);

    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    freqs.forEach((freq) => {
      const osc = state.audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
    });

    filter.connect(state.gainNode);
    state.gainNode.connect(state.audioCtx.destination);

    state.isAudioPlaying = true;
    audioIconOff.classList.add('hidden');
    audioIconOn.classList.remove('hidden');
    showToast("Cyber Cafe Ambient Sound: ON");
  } else {
    if (state.gainNode) {
      state.gainNode.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + 0.5);
    }
    state.isAudioPlaying = false;
    audioIconOff.classList.remove('hidden');
    audioIconOn.classList.add('hidden');
    showToast("Ambient Sound Muted");
  }
}

/**
 * Toast Notification System
 */
function showToast(message) {
  toastMsg.innerText = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

/**
 * Biozyme Product Interactive Handlers
 */
function initBiozymeProductInteractions() {
  // Flavor Selector
  const flavorBtns = document.querySelectorAll('.flavor-btn');
  const selectedFlavorTitle = document.getElementById('selected-flavor-title');
  const flavorSubtext = document.getElementById('flavor-subtext');

  flavorBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      flavorBtns.forEach((b) => {
        b.classList.remove('bg-surface-container-highest', 'opacity-100');
        b.classList.add('bg-surface-container', 'opacity-80');
      });

      btn.classList.add('bg-surface-container-highest', 'opacity-100');
      btn.classList.remove('opacity-80');

      const flavor = btn.getAttribute('data-flavor');
      const desc = btn.getAttribute('data-desc');

      state.selectedFlavor = flavor;
      if (selectedFlavorTitle) selectedFlavorTitle.innerText = `${flavor} Flavour`;
      if (flavorSubtext) flavorSubtext.innerText = desc;

      showToast(`Selected Flavour: ${flavor}`);
    });
  });

  // Weight Selector & Live Price Updater
  const weightBtns = document.querySelectorAll('.weight-btn');
  const displayPrice = document.getElementById('display-price');
  const displayMrp = document.getElementById('display-mrp');
  const displayDiscount = document.getElementById('display-discount');
  const servingsText = document.getElementById('servings-text');

  weightBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      weightBtns.forEach((b) => {
        b.className = 'weight-btn bg-surface-container text-on-surface-variant hover:text-on-surface py-2 rounded flex flex-col items-center justify-center transition-all';
      });

      btn.className = 'weight-btn active-weight bg-primary-container text-on-primary py-2 rounded flex flex-col items-center justify-center font-bold shadow-md transition-all';

      const price = btn.getAttribute('data-price');
      const mrp = btn.getAttribute('data-mrp');
      const servings = btn.getAttribute('data-servings');
      const discount = btn.getAttribute('data-discount');

      state.selectedPrice = price;

      if (displayPrice) displayPrice.innerText = `₹${parseInt(price, 10).toLocaleString('en-IN')}`;
      if (displayMrp) displayMrp.innerText = `₹${parseInt(mrp, 10).toLocaleString('en-IN')}`;
      if (displayDiscount) displayDiscount.innerText = discount;
      if (servingsText) servingsText.innerText = servings;

      showToast(`Updated Variant: ${btn.querySelector('span').innerText}`);
    });
  });

  // Add to Cart & Buy Now Buttons
  document.querySelectorAll('.biozyme-add-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast(`⚡ Added MB Biozyme (${state.selectedFlavor}) to Cart!`);
    });
  });

  document.querySelectorAll('.biozyme-buy-now').forEach((btn) => {
    btn.addEventListener('click', () => {
      showToast(`🛒 Direct Checkout: MB Biozyme (${state.selectedFlavor}) ₹${parseInt(state.selectedPrice, 10).toLocaleString('en-IN')}`);
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const icon = button.querySelector('.faq-icon');
      const isHidden = content.classList.contains('hidden');

      document.querySelectorAll('.faq-content').forEach((c) => c.classList.add('hidden'));
      document.querySelectorAll('.faq-icon').forEach((i) => i.classList.remove('rotate-180'));

      if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

/**
 * Initialize Event Listeners
 */
function initEvents() {
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
  if (speedBtn) speedBtn.addEventListener('click', cycleSpeed);
  if (frameScrubber) frameScrubber.addEventListener('input', onScrubberInput);

  audioToggle.addEventListener('click', toggleAmbientAudio);

  openMenuBtn.addEventListener('click', () => menuModal.classList.remove('hidden'));
  closeMenuBtn.addEventListener('click', () => menuModal.classList.add('hidden'));
  if (ctaMenuBtn) ctaMenuBtn.addEventListener('click', () => menuModal.classList.remove('hidden'));

  menuModal.addEventListener('click', (e) => {
    if (e.target === menuModal) menuModal.classList.add('hidden');
  });

  if (ctaTourBtn) {
    ctaTourBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      state.currentFrame = 1;
      state.targetFrame = 1;
    });
  }

  reserveBtn.addEventListener('click', () => {
    showToast("✨ Neural Pod reserved at Web X Cafe for today!");
  });

  document.querySelectorAll('.order-sm-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const itemTitle = e.target.parentElement.querySelector('h3').innerText;
      showToast(`☕ Added "${itemTitle}" to your order!`);
    });
  });

  initBiozymeProductInteractions();
}

/**
 * Application Entry Point
 */
async function init() {
  await preloadImages();
  resizeCanvas();
  renderFrame(1);
  initEvents();
  requestAnimationFrame(animate);
}

// Start app
init();
