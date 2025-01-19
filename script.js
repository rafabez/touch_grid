// Select the canvas element and get its 2D rendering context
const canvas = document.getElementById('checkerboardCanvas');
const ctx = canvas.getContext('2d');

// Variables for the Tone.js synth and audio context state
let synth;
let audioContextStarted = false;

// Set canvas dimensions to fit the browser window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Checkerboard configuration
const squareSize = 20; // Size of each square in pixels
const colors = ['#ffffff', '#cccccc']; // Colors for the squares

// Variables for user interaction
let touchX = null;
let touchY = null;
const distortionRadius = 200; // Radius of distortion effect
const spotlightRadius = 300; // Radius of spotlight effect

// Calculate the distance between two points
function distance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

// Draw a single distorted square based on proximity to the interaction point
function drawDistortedSquare(x, y) {
    const dist = distance(x, y, touchX, touchY);
    let distortion = 0;
    if (dist < distortionRadius) {
        distortion = Math.sin(dist * 0.1) * 5; // Create a distortion effect
    }
    ctx.fillStyle = colors[(Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2];
    ctx.fillRect(x + distortion, y + distortion, squareSize, squareSize);
}

// Initialize the Tone.js audio context and synth
function startAudioContext() {
    if (Tone.supported) {
        Tone.start().then(() => {
            audioContextStarted = true;
            synth = new Tone.Synth().toDestination(); // Simple synthesizer
            playSound(); // Play an initial sound for testing
        });
    } else {
        console.error("Tone.js is not supported in this browser.");
    }
}

// Play a short sound using the synth
function playSound() {
    if (synth) {
        synth.triggerAttackRelease("C4", "8n"); // Play a 'C4' note for an 8th note duration
    }
}

// Handle user interaction (mouse or touch)
function handleInteraction(event) {
    // Get the interaction coordinates
    touchX = event.clientX || (event.touches ? event.touches[0].clientX : null);
    touchY = event.clientY || (event.touches ? event.touches[0].clientY : null);

    // Clear the canvas and redraw the checkerboard with distortion
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += squareSize) {
        for (let x = 0; x < canvas.width; x += squareSize) {
            drawDistortedSquare(x, y);
        }
    }
    addSpotlight(); // Add the spotlight effect

    // Start the audio context or play a sound on interaction
    if (!audioContextStarted) {
        startAudioContext();
    } else {
        playSound();
    }
}

// Add a spotlight effect around the interaction point
function addSpotlight() {
    if (touchX !== null && touchY !== null) {
        const gradient = ctx.createRadialGradient(touchX, touchY, 0, touchX, touchY, spotlightRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)'); // Inner glow
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)'); // Outer fade
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Handle window resize events to adjust the canvas size
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y += squareSize) {
        for (let x = 0; x < canvas.width; x += squareSize) {
            drawDistortedSquare(x, y);
        }
    }
    addSpotlight();
});

// Add event listeners for mouse and touch interactions
document.addEventListener('mousemove', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction, { passive: false });
canvas.addEventListener('touchmove', handleInteraction, { passive: false });

// Initial rendering of the checkerboard
for (let y = 0; y < canvas.height; y += squareSize) {
    for (let x = 0; x < canvas.width; x += squareSize) {
        drawDistortedSquare(x, y);
    }
}
addSpotlight(); // Add the initial spotlight
