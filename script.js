function initializeDotGrid() {
    // This function checks if the required GSAP libraries are loaded.
    if (typeof gsap === 'undefined' || typeof InertiaPlugin === 'undefined') {
        setTimeout(initializeDotGrid, 50);
        return;
    }

    // Once the libraries are loaded, we can safely run the main logic.
    gsap.registerPlugin(InertiaPlugin);

    const dotGridConfig = {
        dotSize: 3,
        gap: 30,
        baseColor: "#666666", // Lighter gray for better visibility
        activeColor: "#ec4899", // Vibrant pink for interaction
        proximity: 100,
        shockRadius: 200,
        shockStrength: 3,
        resistance: 500,
        returnDuration: 1.5,
    };

    const header = document.getElementById('interactive-header');
    const canvas = document.getElementById('dot-grid-canvas');
    
    // Guard against the elements not being ready in the DOM
    if (!header || !canvas) {
        setTimeout(initializeDotGrid, 50);
        return;
    }
    const ctx = canvas.getContext('2d');

    let dots = [];
    const pointer = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    };

    const baseRgb = hexToRgb(dotGridConfig.baseColor);
    const activeRgb = hexToRgb(dotGridConfig.activeColor);
    const circlePath = new Path2D();
    circlePath.arc(0, 0, dotGridConfig.dotSize / 2, 0, Math.PI * 2);

    function hexToRgb(hex) {
        const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!m) return { r: 0, g: 0, b: 0 };
        return {
            r: parseInt(m[1], 16),
            g: parseInt(m[2], 16),
            b: parseInt(m[3], 16),
        };
    }

    function buildGrid() {
        const { width, height } = header.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const cell = dotGridConfig.dotSize + dotGridConfig.gap;
        const cols = Math.floor((width + dotGridConfig.gap) / cell);
        const rows = Math.floor((height + dotGridConfig.gap) / cell);
        const gridW = cell * cols - dotGridConfig.gap;
        const gridH = cell * rows - dotGridConfig.gap;
        const startX = (width - gridW) / 2 + dotGridConfig.dotSize / 2;
        const startY = (height - gridH) / 2 + dotGridConfig.dotSize / 2;

        dots = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cx = startX + x * cell;
                const cy = startY + y * cell;
                dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const proxSq = dotGridConfig.proximity * dotGridConfig.proximity;
        const { x: px, y: py } = pointer;

        for (const dot of dots) {
            const ox = dot.cx + dot.xOffset;
            const oy = dot.cy + dot.yOffset;
            const dx = dot.cx - px;
            const dy = dot.cy - py;
            const dsq = dx * dx + dy * dy;

            let style = dotGridConfig.baseColor;
            if (dsq <= proxSq) {
                const t = 1 - Math.sqrt(dsq) / dotGridConfig.proximity;
                const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
                const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
                const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
                style = `rgb(${r},${g},${b})`;
            }

            ctx.save();
            ctx.translate(ox, oy);
            ctx.fillStyle = style;
            ctx.fill(circlePath);
            ctx.restore();
        }
        requestAnimationFrame(draw);
    }
    
    function onMove(e) {
        const rect = header.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    }

    function onClick(e) {
        const rect = header.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        for (const dot of dots) {
            const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
            if (dist < dotGridConfig.shockRadius && !dot._inertiaApplied) {
                dot._inertiaApplied = true;
                gsap.killTweensOf(dot);
                const falloff = Math.max(0, 1 - dist / dotGridConfig.shockRadius);
                const pushX = (dot.cx - cx) * dotGridConfig.shockStrength * falloff;
                const pushY = (dot.cy - cy) * dotGridConfig.shockStrength * falloff;
                gsap.to(dot, {
                    inertia: { xOffset: pushX, yOffset: pushY, resistance: dotGridConfig.resistance },
                    onComplete: () => {
                        gsap.to(dot, {
                            xOffset: 0,
                            yOffset: 0,
                            duration: dotGridConfig.returnDuration,
                            ease: "elastic.out(1,0.75)",
                            onComplete: () => { dot._inertiaApplied = false; }
                        });
                    },
                });
            }
        }
    }

    buildGrid();
    draw();

    window.addEventListener('resize', buildGrid);
    header.addEventListener('mousemove', onMove, { passive: true });
    header.addEventListener('click', onClick);
}

// Start the initialization process once the DOM is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDotGrid);
} else {
    initializeDotGrid();
}

document.addEventListener('DOMContentLoaded', () => {
    const contactModal = document.getElementById('contactModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModal');

    // Function to open the modal
    function openModal() {
        if (contactModal) {
            contactModal.classList.remove('hidden');
            contactModal.classList.add('flex');
        }
    }

    // Function to close the modal
    function closeModal() {
        if (contactModal) {
            contactModal.classList.add('hidden');
            contactModal.classList.remove('flex');
        }
    }

    // Event listeners
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal if background is clicked
    if (contactModal) {
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) {
                closeModal();
            }
        });
    }
});
