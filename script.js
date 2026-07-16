// ---------------------------------------------------------------
// Kedi Jest Panosu - tarayici tarafi el jesti tanima
//
// Bu dosya main.py / gesture_utils.py (masaustu Python surumu) ile
// AYNI mantigi JavaScript'te calistirir. Bir kurali degistirirsen
// iki tarafta da (varsa) tutarli tutmayi unutma.
//
// MediaPipe Tasks Vision (Google'in resmi web kutuphanesi) CDN'den
// yukleniyor, hicbir build adimi gerekmiyor.
// ---------------------------------------------------------------

import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

// --- Kalibrasyon sabitleri (Python surumuyle ayni) ---
const STRAIGHT_ANGLE_THRESHOLD = 150;
const TRIANGLE_DISTANCE = 0.09;
const HEAD_ZONE_Y = 0.4;

const FINGER_JOINTS = {
  thumb: [1, 2, 4],
  index: [5, 6, 8],
  middle: [9, 10, 12],
  ring: [13, 14, 16],
  pinky: [17, 18, 20],
};

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// jest adi -> images/ klasorundeki gercek dosya adi
const GESTURE_FILES = {
  above_head: "endiseli.jpg",
  triangle: "baskan.jpg",
  raised: "komiser.jpeg",
  fist: "kahkaha.jpg",
  open_palm: "komik.jpg",
  point: "ogrenci.jpg",
  shaka: "cool.jpg",
  unknown: "sinsi.jpg",
};

// --- Geometri yardimcilari (gesture_utils.py'nin JS karsiligi) ---

function angleDeg(a, b, c) {
  const bax = a.x - b.x, bay = a.y - b.y;
  const bcx = c.x - b.x, bcy = c.y - b.y;
  const magBa = Math.hypot(bax, bay);
  const magBc = Math.hypot(bcx, bcy);
  if (magBa === 0 || magBc === 0) return 180;
  let cos = (bax * bcx + bay * bcy) / (magBa * magBc);
  cos = Math.max(-1, Math.min(1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

function classifySingleHand(landmarks) {
  return ["thumb", "index", "middle", "ring", "pinky"].map((name) => {
    const [i1, i2, i3] = FINGER_JOINTS[name];
    const a = angleDeg(landmarks[i1], landmarks[i2], landmarks[i3]);
    return a > STRAIGHT_ANGLE_THRESHOLD ? 1 : 0;
  });
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function handsFormTriangle(a, b, threshold = TRIANGLE_DISTANCE) {
  const thumbDist = dist(a[4], b[4]);
  const indexDist = dist(a[8], b[8]);
  return thumbDist < threshold && indexDist < threshold;
}

function handCenterY(landmarks) {
  return landmarks.reduce((sum, lm) => sum + lm.y, 0) / landmarks.length;
}

// --- Jest karar mantigi (main.py:determine_gesture ile ayni oncelik) ---

function determineGesture(handsLandmarks) {
  const n = handsLandmarks.length;

  if (n >= 2) {
    const [a, b] = handsLandmarks;
    const yA = handCenterY(a);
    const yB = handCenterY(b);

    if (yA < HEAD_ZONE_Y && yB < HEAD_ZONE_Y) return "above_head";
    if (handsFormTriangle(a, b)) return "triangle";
    return "raised";
  }

  if (n === 1) {
    const [thumb, index, middle, ring, pinky] = classifySingleHand(handsLandmarks[0]);

    if (index === 0 && middle === 0 && ring === 0 && pinky === 0) return "fist";
    if (thumb === 1 && index === 1 && middle === 1 && ring === 1 && pinky === 1) return "open_palm";
    if (index === 1 && middle === 0 && ring === 0 && pinky === 0) return "point";
    if (thumb === 1 && pinky === 1) return "shaka";
    return "unknown";
  }

  return "unknown";
}

// --- DOM referanslari ---

const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const startOverlay = document.getElementById("startOverlay");
const startHint = document.getElementById("startHint");
const reactionImg = document.getElementById("reactionImg");
const gestureLabel = document.getElementById("gestureLabel");
const devInfo = document.getElementById("devInfo");
const cards = Array.from(document.querySelectorAll(".card[data-gesture]"));

let handLandmarker = null;
let lastGesture = null;
let rafId = null;

// --- Model yukleme (buton tiklanmadan once arka planda baslar) ---

const modelReadyPromise = (async () => {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    return true;
  } catch (err) {
    console.error("Model yuklenemedi:", err);
    return false;
  }
})();

// --- Kamera baslatma ---

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  startHint.textContent = "Model ve kamera hazirlaniyor...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
      audio: false,
    });
    video.srcObject = stream;
    await video.play();

    const modelOk = await modelReadyPromise;
    if (!modelOk || !handLandmarker) {
      startHint.textContent =
        "El tespit modeli yuklenemedi. Internet baglantini kontrol edip sayfayi yenile.";
      startBtn.disabled = false;
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    startOverlay.style.display = "none";
    startDetectionLoop();
  } catch (err) {
    console.error(err);
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      startHint.textContent =
        "Kamera izni reddedildi. Tarayici ayarlarindan bu siteye kamera izni ver ve tekrar dene.";
    } else if (err.name === "NotFoundError") {
      startHint.textContent = "Kamera bulunamadi.";
    } else {
      startHint.textContent = "Bir sorun oldu: " + err.message;
    }
    startBtn.disabled = false;
  }
});

// --- Tespit dongusu ---

function startDetectionLoop() {
  const loop = () => {
    if (video.readyState >= 2) {
      const nowMs = performance.now();
      const result = handLandmarker.detectForVideo(video, nowMs);
      handleResult(result);
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}

function handleResult(result) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const handsLandmarks = result.landmarks || [];

  for (const landmarks of handsLandmarks) {
    drawHand(landmarks);
  }

  const gesture = determineGesture(handsLandmarks);
  updateReaction(gesture);
  updateDevInfo(handsLandmarks, gesture);
}

function drawHand(landmarks) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.strokeStyle = "#3ecf6e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
    ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
  }
  ctx.stroke();

  ctx.fillStyle = "#3ecf6e";
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateReaction(gesture) {
  if (gesture === lastGesture) return;
  lastGesture = gesture;

  const filename = GESTURE_FILES[gesture] || GESTURE_FILES.unknown;
  reactionImg.src = `images/${filename}`;
  gestureLabel.textContent = gesture;

  for (const card of cards) {
    card.classList.toggle("active", card.dataset.gesture === gesture);
  }
}

function updateDevInfo(handsLandmarks, gesture) {
  const n = handsLandmarks.length;
  let text = `el sayisi: ${n}\njest: ${gesture}\n`;

  if (n === 1) {
    const fingers = classifySingleHand(handsLandmarks[0]);
    text += `parmaklar (b,i,o,y,s): [${fingers.join(", ")}]`;
  } else if (n >= 2) {
    const yA = handCenterY(handsLandmarks[0]).toFixed(2);
    const yB = handCenterY(handsLandmarks[1]).toFixed(2);
    text += `y_a: ${yA}  y_b: ${yB}\nHEAD_ZONE_Y: ${HEAD_ZONE_Y}`;
  }

  devInfo.textContent = text;
}
