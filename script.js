document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initParticles();
    initMagneticButtons();
    initTiltCards();
    initCalculator();
});

/* =========================================
   1. CUSTOM CURSOR
   ========================================= */
function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let outlineX = mouseX;
    let outlineY = mouseY;
    
    // Check if it's a touch device, if so don't show custom cursor
    if (window.matchMedia("(max-width: 900px)").matches || 'ontouchstart' in window) {
        return;
    }

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    // Smooth outline movement
    function animateOutline() {
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        
        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;
        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover states for interactive elements
    const interactives = document.querySelectorAll('button, select, input, .example-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Click Ripple effect on body
    window.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${e.clientX - 20}px`;
        ripple.style.top = `${e.clientY - 20}px`;
        ripple.style.width = '40px';
        ripple.style.height = '40px';
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

/* =========================================
   2. PARTICLES SYSTEM
   ========================================= */
function initParticles() {
    const container = document.getElementById('particles-container');
    const count = 30;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize initial properties
        const size = Math.random() * 8 + 3;
        const left = Math.random() * 100;
        const duration = Math.random() * 10 + 15;
        const delay = Math.random() * 15;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `-${delay}s`;
        
        container.appendChild(particle);
    }
}

/* =========================================
   3. MAGNETIC BUTTONS
   ========================================= */
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Limit the magnetic pull distance
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });
}

/* =========================================
   4. 3D TILT EFFECT
   ========================================= */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

/* =========================================
   5. CALCULATOR LOGIC
   ========================================= */
function initCalculator() {
    const btn = document.getElementById('calculate-btn');
    const typeSelect = document.getElementById('substance-type');
    const kGroup = document.getElementById('k-value-group');
    const kLabel = document.getElementById('k-value-label');
    const exampleCards = document.querySelectorAll('.example-card');
    const predefinedSelect = document.getElementById('predefined-substance');
    
    predefinedSelect.addEventListener('change', (e) => {
        if (!e.target.value) return;
        try {
            const data = JSON.parse(e.target.value);
            typeSelect.value = data.type;
            
            // manually trigger the typeSelect change logic
            typeSelect.dispatchEvent(new Event('change'));
            
            if (data.k) {
                document.getElementById('k-value').value = data.k;
            } else {
                document.getElementById('k-value').value = '';
            }
        } catch(err) {
            console.error('Error parsing predefined substance data', err);
        }
    });

    // Toggle Ka/Kb input based on substance type
    typeSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'weak-acid' || val === 'weak-base') {
            kGroup.style.display = 'block';
            kLabel.textContent = val === 'weak-acid' ? 'Ka Value' : 'Kb Value';
        } else {
            kGroup.style.display = 'none';
        }
    });

    btn.addEventListener('click', calculateAndAnimate);
    
    // Example cards click
    exampleCards.forEach(card => {
        card.addEventListener('click', () => {
            const ph = parseFloat(card.dataset.ph);
            // Reverse calculate H+ concentration
            const hConc = Math.pow(10, -ph);
            document.getElementById('substance-type').value = 'strong-acid'; // default roughly
            kGroup.style.display = 'none';
            document.getElementById('predefined-substance').value = '';
            document.getElementById('concentration').value = hConc;
            calculateAndAnimate();
        });
    });

    // Run initial calculation
    setTimeout(calculateAndAnimate, 500);
}

function calculateAndAnimate() {
    const type = document.getElementById('substance-type').value;
    const c = parseFloat(document.getElementById('concentration').value);
    const kVal = parseFloat(document.getElementById('k-value').value);
    
    if (isNaN(c) || c <= 0) {
        alert("Please enter a valid concentration greater than 0.");
        return;
    }

    let ph = 0;
    
    if (type === 'strong-acid') {
        ph = -Math.log10(c);
    } else if (type === 'strong-base') {
        const poh = -Math.log10(c);
        ph = 14 - poh;
    } else if (type === 'weak-acid') {
        if (isNaN(kVal) || kVal <= 0) return alert("Enter a valid Ka value.");
        // Simplified: [H+] = sqrt(Ka * C)
        const hConc = Math.sqrt(kVal * c);
        ph = -Math.log10(hConc);
    } else if (type === 'weak-base') {
        if (isNaN(kVal) || kVal <= 0) return alert("Enter a valid Kb value.");
        // Simplified: [OH-] = sqrt(Kb * C)
        const ohConc = Math.sqrt(kVal * c);
        const poh = -Math.log10(ohConc);
        ph = 14 - poh;
    }

    // Clamp pH between 0 and 14 for display bounds safely
    ph = Math.max(-1, Math.min(15, ph));
    
    updateDisplay(ph);
}

function updateDisplay(targetPh) {
    const hConcNode = document.getElementById('h-conc');
    const ohConcNode = document.getElementById('oh-conc');
    const pohNode = document.getElementById('poh-value');
    
    const root = document.documentElement;
    const valueDisplay = document.getElementById('ph-value');
    const needle = document.getElementById('ph-needle');
    
    const dangerFill = document.getElementById('danger-fill');
    const dangerLabel = document.getElementById('danger-label');

    // Calculate related values
    const hConc = Math.pow(10, -targetPh);
    const poh = 14 - targetPh;
    const ohConc = Math.pow(10, -poh);

    // Format and set output numbers
    hConcNode.textContent = hConc.toExponential(2) + ' M';
    ohConcNode.textContent = ohConc.toExponential(2) + ' M';
    pohNode.textContent = poh.toFixed(2);

    // Animate pH Number
    animateValue(valueDisplay, parseFloat(valueDisplay.textContent) || 0, targetPh, 1000);

    // Update colors
    let activeColor = '';
    let dangerLevel = '';
    let dangerWidth = '0%';
    let dangerColor = '';

    if (targetPh <= 1) {
        activeColor = '#ff0000';
        dangerLevel = '☠️ Extremely corrosive — never touch';
        dangerWidth = '100%';
        dangerColor = '#ff0000';
    } else if (targetPh <= 3) {
        activeColor = '#ff3333';
        dangerLevel = '🚫 Corrosive — do not consume';
        dangerWidth = '80%';
        dangerColor = '#ff3333';
    } else if (targetPh <= 4) {
        activeColor = '#ff9900';
        dangerLevel = '⚠️ Edible but very acidic (e.g. vinegar)';
        dangerWidth = '40%';
        dangerColor = '#ff9900';
    } else if (targetPh <= 6) {
        activeColor = '#ffcc00';
        dangerLevel = '✅ Safe to consume (e.g. coffee, juice)';
        dangerWidth = '20%';
        dangerColor = '#ffcc00';
    } else if (targetPh <= 8) {
        activeColor = '#00ff00';
        dangerLevel = '✅ Perfectly safe — neutral range';
        dangerWidth = '5%';
        dangerColor = '#00ff00';
    } else if (targetPh <= 10) {
        activeColor = '#ffcc00';
        dangerLevel = '✅ Mildly basic — safe externally';
        dangerWidth = '20%';
        dangerColor = '#ffcc00';
    } else if (targetPh <= 11) {
        activeColor = '#ff9900';
        dangerLevel = '⚠️ Caution — irritating to skin';
        dangerWidth = '40%';
        dangerColor = '#ff9900';
    } else if (targetPh <= 13) {
        activeColor = '#ff3333';
        dangerLevel = '🚫 Corrosive — causes burns';
        dangerWidth = '80%';
        dangerColor = '#ff3333';
    } else {
        activeColor = '#ff0000';
        dangerLevel = '☠️ Extremely corrosive — never touch';
        dangerWidth = '100%';
        dangerColor = '#ff0000';
    }

    // Exact text overrides for specific quick example values
    const diff = (val) => Math.abs(targetPh - val) < 0.02;
    if (diff(0.5)) dangerLevel = '☠️ Extremely corrosive';
    if (diff(1.5)) dangerLevel = '🚫 Corrosive (internal only, not drinkable)';
    if (diff(2.4)) dangerLevel = '🚫 Corrosive in pure form';
    if (diff(2.9)) dangerLevel = '⚠️ Edible but very acidic';
    if (diff(3.5)) dangerLevel = '⚠️ Edible but very acidic';
    if (diff(5.0)) dangerLevel = '✅ Safe to consume';
    if (diff(6.5)) dangerLevel = '✅ Safe to consume';
    if (diff(7.0)) dangerLevel = '✅ Perfectly safe';
    if (diff(7.4)) dangerLevel = '✅ Perfectly safe';
    if (diff(8.3)) dangerLevel = '✅ Mildly basic — safe externally';
    if (diff(11.5)) dangerLevel = '🚫 Corrosive — causes burns';
    if (diff(12.5)) dangerLevel = '🚫 Corrosive — causes burns';
    if (diff(14.0)) dangerLevel = '☠️ Extremely corrosive';

    root.style.setProperty('--active-color', activeColor);
    
    // Update Needle
    const clampedPh = Math.max(0, Math.min(14, targetPh));
    const percent = (clampedPh / 14) * 100;
    needle.style.left = `${percent}%`;

    // Update Danger Meter
    dangerFill.style.width = dangerWidth;
    dangerFill.style.backgroundColor = dangerColor;
    dangerLabel.textContent = dangerLevel;
    dangerLabel.style.color = dangerColor;
}

// Simple text counter animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing out
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = (start + (end - start) * easeProgress).toFixed(2);
        obj.innerHTML = current;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end.toFixed(2);
        }
    };
    window.requestAnimationFrame(step);
}
