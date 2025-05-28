const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Load images
const sourceImg = new Image();
sourceImg.src = 'flowers.jpg'; // Replace
const occluderImg = new Image();
occluderImg.src = 'coffee.jpg'; // Replace

// Parameters
const params = {
    maxRadius: 125,  // Maximum aperture radius
    minRadius: 20,    // Minimum aperture radius
    spacing: 100,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowBlur: 5,
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowInset: 2      // Amount to inset the shadow
};

let apertures = [];
let animationRunning = true;

function createApertures() {
    const xsamples = Math.floor(canvas.width / params.spacing);
    const ysamples = Math.floor(canvas.height / params.spacing);

    for (let y = 0; y < ysamples; y++) {
        for (let x = 0; x < xsamples; x++) {
            const posX = x * params.spacing + params.spacing / 2;
            const posY = y * params.spacing + params.spacing / 2;

            apertures.push({
                x: posX,
                y: posY,
                radius: params.minRadius, // Start at minimum radius
                rotation: 0,
                growthRate: 0.5       // Rate at which the radius increases
            });
        }
    }
}

function drawAperture(aperture) {
    ctx.save();
    ctx.translate(aperture.x, aperture.y);
    ctx.rotate(aperture.rotation * Math.PI / 180);

    // 1. Draw Shadow Circle
    const shadowRadius = aperture.radius - params.shadowInset;  // Calculate shadow size
    ctx.shadowColor = params.shadowColor;
    ctx.shadowBlur = params.shadowBlur;
    ctx.shadowOffsetX = params.shadowOffsetX;
    ctx.shadowOffsetY = params.shadowOffsetY;

    ctx.beginPath();
    ctx.arc(0, 0, shadowRadius, 0, Math.PI * 2);  // Shadow circle
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';  // Or match occluder color as needed
    ctx.fill();

    // Reset Shadow Properties
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 2. Clip and Draw Source Image
    ctx.beginPath();
    ctx.arc(0, 0, aperture.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(sourceImg, -aperture.x, -aperture.y);

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(occluderImg, 0, 0, canvas.width, canvas.height);

    apertures.forEach(aperture => {
        drawAperture(aperture);
    });

    // Update aperture radii
    apertures.forEach(aperture => {
        aperture.radius += aperture.growthRate; // Increase radius

        // Reverse growth at min/max values
        if (aperture.radius > params.maxRadius || aperture.radius < params.minRadius) {
            aperture.growthRate *= -1;  // Reverse direction
        }
    });

    if (animationRunning) {
        requestAnimationFrame(draw);
    }
}

// Start drawing when images are loaded
Promise.all([
    new Promise(resolve => sourceImg.onload = resolve),
    new Promise(resolve => occluderImg.onload = resolve)
]).then(() => {
    createApertures();
    animationRunning = true;
    draw();
});
