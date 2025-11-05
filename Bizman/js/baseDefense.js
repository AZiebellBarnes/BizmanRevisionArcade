const GRID_SIZE = 12;
const HQ_SIZE = 2;
const SUB_WAVES = 3;
const COSTS = { collector: 25, cannon: 40, wall: 18, tesla: 55, splash: 48, slow: 34 };
const UPGRADE_COST = { collector: 18, cannon: 28, wall: 15, tesla: 30, splash: 26, slow: 22 };
const BUILD_HP = { collector: 80, cannon: 110, wall: 320, tesla: 125, splash: 110, slow: 95 };
const ALIEN_TYPES = {
  grunt: { label: "G", hp: 95, dmg: 18, speed: 1, color: "" },
  // Make runners slower by default (were speed:2)
  runner: { label: "R", hp: 60, dmg: 14, speed: 1, color: "runner" },
  brute: { label: "B", hp: 170, dmg: 30, speed: 1, armor: 0.3, color: "brute" },
  shield: { label: "S", hp: 110, dmg: 22, speed: 1, shield: 0.35, color: "shield" }
};

const TECH = { tesla: false, splash: false, slow: false, range: false, power: false };

const state = {
  baseGrid: [],
  hqCells: [],
  selectedCell: null,
  selectedBuild: null,
  energy: 0,
  hearts: 3,
  wave: 1,
  subWave: 1,
  cores: 0,
  waveActive: false,
  showPaths: false,
  aliens: [],
  tickId: null,
  distanceMap: [],
  nextAlienId: 1,
  tickCount: 0
};

let elements = {};
let helpers = {};
let finishHandler = () => {};
import { playSound } from "./sound.js";

export function initBaseDefense({ elements: elRefs, toast, onFinish, requestNextQuestion }) {
  elements = elRefs;
  helpers.toast = toast;
  helpers.requestNextQuestion = requestNextQuestion;
  finishHandler = onFinish;

  elements.upgradeBtn.addEventListener("click", upgradeStructure);
  elements.startWaveBtn.addEventListener("click", () => startWave());
  elements.resetBaseBtn.addEventListener("click", resetBase);
  elements.togglePathsBtn.addEventListener("click", () => {
    state.showPaths = !state.showPaths;
    renderBase();
  });
  elements.unlockTeslaBtn.addEventListener("click", () => unlockTech("tesla"));
  elements.unlockSplashBtn.addEventListener("click", () => unlockTech("splash"));
  elements.unlockSlowBtn.addEventListener("click", () => unlockTech("slow"));
  elements.unlockRangeBtn?.addEventListener("click", () => unlockTech("range"));
  elements.unlockPowerBtn?.addEventListener("click", () => unlockTech("power"));
  elements.upgradeEnergyBtn?.addEventListener("click", upgradeEnergyPerQuestion);

  document.addEventListener("click", event => {
    const button = event.target.closest(".build-btn");
    if (!button) return;
    const type = button.dataset.type;
    if (type) {
      state.selectedBuild = type;
      helpers.toast(`Selected build: ${type}`);
    }
  });
}

export function resetBaseSession() {
  resetTech();
  Object.assign(state, {
    baseGrid: [],
    hqCells: [],
    selectedCell: null,
    selectedBuild: null,
    energy: 0,
    hearts: 3,
    wave: 1,
    subWave: 1,
    cores: 0,
    waveActive: false,
    showPaths: false,
    aliens: [],
    distanceMap: [],
    nextAlienId: 1,
    tickCount: 0,
    energyPerQBonus: 0
  });
  elements.projectileLayer.innerHTML = "";
  initBaseGrid();
  stopTicks();
  updateBaseHUD();
  elements.baseAnnouncerEl.textContent =
    "Build phase: answer questions to earn energy, then start the invasion.";
  elements.startWaveBtn.disabled = false;
  elements.startWaveBtn.textContent = "Start Wave";
}

export function handleBaseAnswer(correct, streak) {
  if (!correct) {
    helpers.toast("No energy from that one.");
    return;
  }
  const gain = 10 + Math.max(0, streak * 2) + (state.energyPerQBonus || 0);
  state.energy += gain;
  helpers.toast(`Earned ${gain} energy.`);
  updateBaseHUD();
}

export function handleBaseSkip() {
  // currently no special behaviour on skip
}

export function isWaveActive() {
  return state.waveActive;
}

export function getBaseSummary() {
  return { wave: state.wave, subWave: state.subWave, hearts: state.hearts, cores: state.cores };
}

function resetTech() {
  TECH.tesla = false;
  TECH.splash = false;
  TECH.slow = false;
  TECH.range = false;
  TECH.power = false;
}

function unlockTech(type) {
  if (TECH[type] || state.cores < 1) return;
  state.cores -= 1;
  TECH[type] = true;
  helpers.toast(`${type.charAt(0).toUpperCase() + type.slice(1)} unlocked.`);
  playSound("unlock");
  updateBaseHUD();
}

function initBaseGrid() {
  state.baseGrid = [];
  state.hqCells = [];
  elements.baseGridEl.innerHTML = "";
  elements.projectileLayer.innerHTML = "";
  document.documentElement.style.setProperty("--grid-size", GRID_SIZE);
  elements.baseGridEl.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

  const startX = Math.floor((GRID_SIZE - HQ_SIZE) / 2);
  const startY = Math.floor((GRID_SIZE - HQ_SIZE) / 2);
  for (let y = 0; y < GRID_SIZE; y += 1) {
    state.baseGrid[y] = [];
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const cell = { type: "empty", lvl: 0, hp: 0, maxHp: 0 };
      if (x >= startX && x < startX + HQ_SIZE && y >= startY && y < startY + HQ_SIZE) {
        cell.type = "hq";
        cell.lvl = 1;
        cell.hp = 9999;
        cell.maxHp = 9999;
        state.hqCells.push({ x, y });
      }
      state.baseGrid[y][x] = cell;
      const tile = document.createElement("div");
      tile.className = "tile" + (cell.type === "hq" ? " hq" : "");
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.onclick = () => onTileClick(x, y);
      if (cell.type === "hq") {
        tile.textContent = "HQ";
      }
      elements.baseGridEl.appendChild(tile);
    }
  }
  renderBase();
}

function onTileClick(x, y) {
  state.selectedCell = { x, y };
  updateBaseHUD();
  highlightRanges();
  const cell = state.baseGrid[y][x];
  let attemptedBuild = false;
  if (state.selectedBuild && cell.type === "empty") {
    attemptedBuild = true;
    if (placeSelectedBuild(x, y)) {
      return;
    }
  }
  if (!attemptedBuild) {
    helpers.toast(`Selected tile (${x + 1}, ${y + 1})`);
  }
}

function abbr(type) {
  switch (type) {
    case "collector":
      return "C";
    case "cannon":
      return "K";
    case "wall":
      return "W";
    case "tesla":
      return "T";
    case "splash":
      return "S";
    case "slow":
      return "P";
    default:
      return "";
  }
}

function renderBase() {
  [...elements.baseGridEl.children].forEach(tile => {
    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    const cell = state.baseGrid[y][x];
    tile.className = "tile";
    tile.textContent = "";
    if (cell.type !== "empty") {
      tile.classList.add(cell.type);
    }
    if (cell.type === "hq") {
      tile.classList.add("hq");
      tile.textContent = "HQ";
    } else if (cell.type !== "empty") {
      tile.textContent = `${abbr(cell.type)}${cell.lvl}`;
    }

    tile.querySelector(".hp-bar")?.remove();
    if (cell.maxHp > 0 && cell.type !== "hq" && cell.type !== "empty") {
      const ratio = Math.max(0, Math.min(1, cell.hp / cell.maxHp));
      const bar = document.createElement("div");
      bar.className = "hp-bar";
      if (ratio < 0.3) {
        bar.classList.add("critical");
      } else if (ratio < 0.6) {
        bar.classList.add("warn");
      }
      const fill = document.createElement("div");
      fill.className = "fill";
      fill.style.width = `${Math.max(5, Math.round(ratio * 100))}%`;
      bar.appendChild(fill);
      tile.appendChild(bar);
    }

    tile.querySelector(".path")?.remove();
    if (state.showPaths && cell.type === "empty") {
      const pathEl = document.createElement("div");
      pathEl.className = "path";
      tile.appendChild(pathEl);
    }
  });
  highlightRanges();
  drawAliens();
}

function isHQCell(x, y) {
  return state.hqCells.some(cell => cell.x === x && cell.y === y);
}

function highlightRanges() {
  [...elements.baseGridEl.children].forEach(t => t.classList.remove("range"));
  if (!state.selectedCell) return;
  const cell = state.baseGrid[state.selectedCell.y][state.selectedCell.x];
  if (!["cannon", "tesla", "splash"].includes(cell.type)) return;

  const range = cell.type === "cannon" ? 3 + cell.lvl : cell.type === "tesla" ? 3 + cell.lvl : 2 + cell.lvl;
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const dist = Math.abs(x - state.selectedCell.x) + Math.abs(y - state.selectedCell.y);
      if (dist <= range) {
        elements.baseGridEl.children[y * GRID_SIZE + x].classList.add("range");
      }
    }
  }
}

function updateBaseHUD() {
  elements.energyEl.textContent = state.energy;
  elements.heartsEl.textContent = state.hearts;
  elements.waveEl.textContent = `${state.wave} (${state.subWave}/${SUB_WAVES})`;
  elements.coresEl.textContent = state.cores;
  elements.startWaveBtn.disabled = state.waveActive;
  if (elements.hqHealthFill) {
    const ratio = Math.max(0, Math.min(1, state.hearts / 3));
    elements.hqHealthFill.style.width = `${Math.round(ratio * 100)}%`;
    const hue = Math.round(120 * ratio); // 120 = green, 0 = red
    elements.hqHealthFill.style.background = `hsl(${hue} 80% 45%)`;
  }
  lockButtons();
}

function lockButtons() {
  document.querySelectorAll(".build-btn").forEach(btn => {
    const type = btn.dataset.type;
    if (!type) return;
    if (["tesla", "splash", "slow"].includes(type)) {
      btn.disabled = !TECH[type];
    }
  });

  elements.unlockTeslaBtn.disabled = TECH.tesla || state.cores < 1;
  elements.unlockSplashBtn.disabled = TECH.splash || state.cores < 1;
  elements.unlockSlowBtn.disabled = TECH.slow || state.cores < 1;
  if (elements.unlockRangeBtn) elements.unlockRangeBtn.disabled = TECH.range || state.cores < 1;
  if (elements.unlockPowerBtn) elements.unlockPowerBtn.disabled = TECH.power || state.cores < 1;
  if (elements.upgradeEnergyBtn) elements.upgradeEnergyBtn.disabled = state.cores < 1;
  elements.upgradeBtn.disabled = !state.selectedCell;
}

function upgradeEnergyPerQuestion() {
  if (state.cores < 1) {
    helpers.toast("Not enough cores.");
    return;
  }
  state.cores -= 1;
  state.energyPerQBonus = (state.energyPerQBonus || 0) + 2;
  helpers.toast(`Energy per question increased by +2 (now +${state.energyPerQBonus}).`);
  playSound("upgrade");
  updateBaseHUD();
}

function setStructure(x, y, type) {
  const cell = state.baseGrid[y][x];
  cell.type = type;
  cell.lvl = 1;
  cell.maxHp = BUILD_HP[type] || 80;
  cell.hp = cell.maxHp;
}

function placeSelectedBuild(x, y) {
  if (!state.selectedBuild) return false;
  const cell = state.baseGrid[y][x];
  if (cell.type !== "empty") {
    helpers.toast("Tile already occupied.");
    return false;
  }
  if (["tesla", "splash", "slow"].includes(state.selectedBuild) && !TECH[state.selectedBuild]) {
    helpers.toast("Unlock that tech first.");
    return false;
  }
  const cost = COSTS[state.selectedBuild] || 0;
  if (state.energy < cost) {
    helpers.toast("Not enough energy.");
    return false;
  }
  state.energy -= cost;
  setStructure(x, y, state.selectedBuild);
  state.selectedCell = { x, y };
  helpers.toast(`Built ${state.selectedBuild} for ${cost} energy.`);
  playSound("build");
  updateBaseHUD();
  renderBase();
  return true;
}

function upgradeStructure() {
  if (!state.selectedCell) {
    helpers.toast("Select a tile to upgrade.");
    return;
  }
  const cell = state.baseGrid[state.selectedCell.y][state.selectedCell.x];
  if (!["collector", "cannon", "wall", "tesla", "splash", "slow"].includes(cell.type)) {
    helpers.toast("Nothing to upgrade here.");
    return;
  }
  const cost = (UPGRADE_COST[cell.type] || 0) * cell.lvl;
  if (state.energy < cost) {
    helpers.toast("Not enough energy.");
    return;
  }
  state.energy -= cost;
  cell.lvl += 1;
  if (cell.type === "wall") {
    cell.maxHp += 120;
  } else {
    cell.maxHp = Math.round(cell.maxHp * 1.25);
  }
  cell.hp = cell.maxHp;
  helpers.toast(`Upgraded ${cell.type} to level ${cell.lvl} for ${cost}.`);
  playSound("upgrade");
  updateBaseHUD();
  renderBase();
}

function startWave() {
  if (state.waveActive) {
    helpers.toast("Wave already running.");
    return;
  }
  if (state.aliens.length > 0) {
    state.aliens = [];
    drawAliens();
  }
  state.waveActive = true;
  elements.startWaveBtn.disabled = true;
  elements.startWaveBtn.textContent = "Wave in progress";
  elements.baseAnnouncerEl.textContent = `Level ${state.wave} - Wave ${state.subWave}/${SUB_WAVES} incoming!`;
  spawnAliens();
  stopTicks();
  // Keep tower fire rate the same, but we will move aliens every other tick
  state.tickId = setInterval(gameTick, 550);
  playSound("wave_start");
  try { document.dispatchEvent(new CustomEvent('base:startWave')); } catch (e) {}
}

function stopTicks() {
  if (state.tickId) {
    clearInterval(state.tickId);
    state.tickId = null;
  }
}

function resetBase() {
  resetBaseSession();
  helpers.toast("Base reset. Earn energy and rebuild.");
}

function buildWaveComposition(level, segment) {
  const count = 6 + (level - 1) * 3 + segment * 2;
  const weights = [
    { type: "grunt", weight: 6 },
    { type: "runner", weight: Math.max(0, level - 1) + (segment > 1 ? 1 : 0) },
    { type: "brute", weight: Math.max(0, level - 2) },
    { type: "shield", weight: Math.max(0, level - 3) }
  ];
  const totalWeight = weights.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  const composition = [];
  for (let i = 0; i < count; i += 1) {
    let roll = Math.random() * totalWeight;
    for (const entry of weights) {
      roll -= entry.weight;
      if (roll <= 0) {
        composition.push(entry.type);
        break;
      }
    }
  }
  if (level >= 3 && segment === SUB_WAVES) {
    composition.push("brute");
  }
  if (level >= 4 && segment === SUB_WAVES) {
    composition.push("shield");
  }
  return composition;
}

function randomEdgeCell() {
  const edge = Math.floor(Math.random() * 4);
  if (edge === 0) {
    return { x: Math.floor(Math.random() * GRID_SIZE), y: 0 };
  }
  if (edge === 1) {
    return { x: GRID_SIZE - 1, y: Math.floor(Math.random() * GRID_SIZE) };
  }
  if (edge === 2) {
    return { x: Math.floor(Math.random() * GRID_SIZE), y: GRID_SIZE - 1 };
  }
  return { x: 0, y: Math.floor(Math.random() * GRID_SIZE) };
}

function spawnAliens() {
  state.aliens = [];
  const types = buildWaveComposition(state.wave, state.subWave);
  types.forEach(type => {
    const config = ALIEN_TYPES[type] || ALIEN_TYPES.grunt;
    let pos;
    let tries = 0;
    do {
      pos = randomEdgeCell();
      tries += 1;
    } while (isHQCell(pos.x, pos.y) && tries < 10);
    state.aliens.push({
      id: state.nextAlienId++,
      type,
      config,
      x: pos.x,
      y: pos.y,
      hp: config.hp,
      maxHp: config.hp,
      slowTicks: 0
    });
  });
  drawAliens();
}

function computeDistanceMap() {
  state.distanceMap = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(Infinity));
  const queue = [];
  state.hqCells.forEach(cell => {
    state.distanceMap[cell.y][cell.x] = 0;
    queue.push({ x: cell.x, y: cell.y });
  });
  const dirs = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 }
  ];
  while (queue.length) {
    const current = queue.shift();
    const currentDist = state.distanceMap[current.y][current.x];
    dirs.forEach(dir => {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) {
        return;
      }
      if (!isWalkable(nx, ny)) {
        return;
      }
      if (state.distanceMap[ny][nx] > currentDist + 1) {
        state.distanceMap[ny][nx] = currentDist + 1;
        queue.push({ x: nx, y: ny });
      }
    });
  }
}

function isWalkable(x, y) {
  const cell = state.baseGrid[y][x];
  return cell.type === "empty" || cell.type === "hq";
}

function decideAlienAction(alien) {
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 }
  ];
  const currentDist = state.distanceMap[alien.y]?.[alien.x] ?? Infinity;
  let moveOption = null;
  let bestDist = currentDist;

  for (const dir of dirs) {
    const nx = alien.x + dir.x;
    const ny = alien.y + dir.y;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) continue;
    if (isHQCell(nx, ny)) {
      return { type: "move", x: nx, y: ny };
    }
    if (isWalkable(nx, ny)) {
      const dist = state.distanceMap[ny][nx];
      if (dist < bestDist) {
        bestDist = dist;
        moveOption = { type: "move", x: nx, y: ny };
      }
    }
  }

  if (moveOption) return moveOption;

  const attackOptions = [];
  dirs.forEach(dir => {
    const nx = alien.x + dir.x;
    const ny = alien.y + dir.y;
    if (nx < 0 || ny < 0 || nx >= GRID_SIZE || ny >= GRID_SIZE) return;
    const cell = state.baseGrid[ny][nx];
    if (cell.type !== "empty" && cell.type !== "hq") {
      attackOptions.push({ type: "attack", x: nx, y: ny, cell });
    }
  });

  if (attackOptions.length) {
    attackOptions.sort((a, b) => a.cell.hp - b.cell.hp);
    return attackOptions[0];
  }
  return null;
}

function moveAliens() {
  let baseBreached = false;
  state.aliens.forEach(alien => {
    if (alien.hp <= 0) return;
    if (alien.slowTicks > 0) {
      alien.slowTicks -= 1;
      return;
    }
    const steps = Math.max(1, alien.config.speed || 1);
    for (let s = 0; s < steps; s += 1) {
      const action = decideAlienAction(alien);
      if (!action) break;
      if (action.type === "move") {
        alien.x = action.x;
        alien.y = action.y;
        if (isHQCell(alien.x, alien.y)) {
          const heartDamage = Math.max(1, Math.round(alien.config.dmg / 20));
          state.hearts = Math.max(0, state.hearts - heartDamage);
          elements.baseAnnouncerEl.textContent = `HQ took ${heartDamage} damage from a ${alien.type}.`;
          playSound("hq_hit");
          alien.hp = 0;
          baseBreached = true;
          updateBaseHUD();
          break;
        }
      } else if (action.type === "attack") {
        attackStructure(alien, action);
        break;
      }
    }
  });
  if (baseBreached && state.hearts <= 0) {
    try { document.dispatchEvent(new CustomEvent('base:gameOver')); } catch (e) {}
    finishHandler({ hearts: state.hearts, wave: state.wave, subWave: state.subWave });
  }
}

function attackStructure(alien, target) {
  const cell = state.baseGrid[target.y][target.x];
  const mitigation = cell.type === "wall" ? 1 : 0.8;
  const damage = Math.round(alien.config.dmg * mitigation);
  cell.hp -= damage;
  playSound("hit");
  if (cell.hp <= 0) {
    helpers.toast(`${cell.type} destroyed.`);
    removeStructure(target.x, target.y);
    playSound("structure_destroyed");
  }
}

function removeStructure(x, y) {
  state.baseGrid[y][x] = { type: "empty", lvl: 0, hp: 0, maxHp: 0 };
  renderBase();
}

function defensesFire() {
  const living = state.aliens.filter(a => a.hp > 0);
  if (living.length === 0) return;

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const cell = state.baseGrid[y][x];
      if (cell.lvl <= 0) continue;

      if (cell.type === "collector") {
        // Passive energy per tick, scales with level
        state.energy += cell.lvl;
        continue;
      }

      if (cell.type === "cannon") {
        const bonus = TECH.range ? 1 : 0;
        const target = findNearestAlien(x, y, 3 + cell.lvl + bonus);
        if (target) {
          spawnProjectileVisual({ x, y }, target, "cannon");
          playSound("fire_cannon");
          applyDamage(target, 24 + cell.lvl * 8, "cannon");
        }
      }

      if (cell.type === "tesla") {
        const bonus = TECH.range ? 1 : 0;
        const targets = findAliensInRange(x, y, 3 + cell.lvl + bonus, 3);
        targets.forEach(t => {
          spawnProjectileVisual({ x, y }, t, "tesla");
          playSound("tesla");
          applyDamage(t, 16 + cell.lvl * 6, "tesla");
          t.slowTicks = Math.max(t.slowTicks, 1 + cell.lvl);
        });
      }

      if (cell.type === "splash") {
        const bonus = TECH.range ? 1 : 0;
        const target = findNearestAlien(x, y, 2 + cell.lvl + bonus);
        if (target) {
          spawnProjectileVisual({ x, y }, target, "splash");
          playSound("splash");
          applyDamage(target, 20 + cell.lvl * 7, "splash");
          const neighbours = findAliensInRange(target.x, target.y, 1, 6);
          neighbours.forEach(n => {
            if (n === target) return;
            applyDamage(n, 12 + cell.lvl * 4, "splash");
          });
        }
      }

      if (cell.type === "slow") {
        const bonus = TECH.range ? 1 : 0;
        const targets = findAliensInRange(x, y, 2 + cell.lvl + bonus, 4);
        targets.forEach(t => {
          applyDamage(t, 6 + cell.lvl * 2, "slow");
          t.slowTicks = Math.max(t.slowTicks, 2 + cell.lvl);
          playSound("slow");
        });
      }
    }
  }

  updateBaseHUD();
}

function findNearestAlien(x, y, range) {
  let nearest = null;
  let best = Infinity;
  state.aliens.forEach(alien => {
    if (alien.hp <= 0) return;
    const dist = Math.abs(alien.x - x) + Math.abs(alien.y - y);
    if (dist <= range && dist < best) {
      best = dist;
      nearest = alien;
    }
  });
  return nearest;
}

function findAliensInRange(x, y, range, maxCount) {
  const results = state.aliens.filter(alien => {
    if (alien.hp <= 0) return false;
    const dist = Math.abs(alien.x - x) + Math.abs(alien.y - y);
    return dist <= range;
  });
  results.sort((a, b) => {
    const da = Math.abs(a.x - x) + Math.abs(a.y - y);
    const db = Math.abs(b.x - x) + Math.abs(b.y - y);
    return da - db;
  });
  return typeof maxCount === "number" ? results.slice(0, maxCount) : results;
}

function applyDamage(alien, amount, source) {
  let damage = amount;
  if (alien.config.armor) damage *= 1 - alien.config.armor;
  if (alien.config.shield && source !== "splash") damage *= 1 - alien.config.shield;
  if (TECH.power) damage *= 1.15;
  damage = Math.max(5, Math.round(damage));
  alien.hp -= damage;
  if (alien.hp <= 0) {
    alien.hp = 0;
    state.energy += 2;
    playSound("alien_die");
  }
  return damage;
}

function cellCenter(x, y) {
  const tile = elements.baseGridEl.children[y * GRID_SIZE + x];
  const gridRect = elements.baseGridEl.getBoundingClientRect();
  const rect = tile.getBoundingClientRect();
  return {
    x: rect.left - gridRect.left + rect.width / 2,
    y: rect.top - gridRect.top + rect.height / 2
  };
}

function spawnProjectileVisual(from, toAlien, type) {
  const start = cellCenter(from.x, from.y);
  const end = cellCenter(toAlien.x, toAlien.y);
  const node = document.createElement("div");
  node.className = `projectile ${type}`;
  node.style.left = `${start.x}px`;
  node.style.top = `${start.y}px`;
  elements.projectileLayer.appendChild(node);
  requestAnimationFrame(() => {
    node.style.transform = `translate(${end.x - start.x}px, ${end.y - start.y}px)`;
  });
  setTimeout(() => node.classList.add("fade"), 240);
  setTimeout(() => node.remove(), 360);
}

function drawAliens() {
  [...elements.baseGridEl.querySelectorAll(".alien")].forEach(a => a.remove());
  state.aliens.forEach(alien => {
    if (alien.hp <= 0) return;
    const idx = alien.y * GRID_SIZE + alien.x;
    const tile = elements.baseGridEl.children[idx];
    const node = document.createElement("div");
    node.className = "alien" + (alien.config.color ? ` ${alien.config.color}` : "");
    node.textContent = alien.config.label;
    node.title = `${alien.type} HP ${alien.hp}`;
    tile.appendChild(node);
  });
}

function cleanupAliens() {
  state.aliens = state.aliens.filter(alien => alien.hp > 0);
}

function handleWaveCleared() {
  stopTicks();
  state.waveActive = false;
  elements.startWaveBtn.disabled = false;

  if (state.subWave < SUB_WAVES) {
    state.subWave += 1;
    state.cores += 1; // award a core on each subwave clear
    elements.startWaveBtn.textContent = `Start Wave ${state.subWave}`;
    elements.baseAnnouncerEl.textContent = `Wave clear! +1 core. Prepare for wave ${state.subWave}/${SUB_WAVES}.`;
  } else {
    state.wave += 1;
    state.subWave = 1;
    state.cores += 1;
    helpers.toast("Level cleared! +1 core.");
    elements.startWaveBtn.textContent = `Start Level ${state.wave}`;
    elements.baseAnnouncerEl.textContent =
      "Level cleared! Spend cores to unlock tech before the next level.";
  }
  playSound("wave_clear");
  updateBaseHUD();
  try { document.dispatchEvent(new CustomEvent('base:waveClear')); } catch (e) {}
}

function gameTick() {
  state.tickCount += 1;
  computeDistanceMap();
  defensesFire();
  // Slow enemies: move only every other tick
  if (state.tickCount % 2 === 0) {
    moveAliens();
  }
  cleanupAliens();
  drawAliens();
  if (state.aliens.length === 0) {
    handleWaveCleared();
  }
}

export function teardownBaseDefense() {
  stopTicks();
}
