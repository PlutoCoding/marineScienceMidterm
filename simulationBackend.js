// Initialize simulation state object
window.simulationState = {
    oceanTemp: 20,
    salinity: 35,
    waveHeight: 1,
    waveSpeed: 5,
    depth: 1000,
    nitrogen: 10,
    phosphorus: 1,
    pH: 7,
    oxygen: 1,
    turbidity: 1,
    sunlightIntensity: 1,
    co2: 400,
    plasticPollution: 0.5,
    heavyMetalPollution: 0.01,
    month: 6,
    timeOfDay: 12,
    fishingDensity: 20,
    boats: 10
};

function calculateDerivedConditions(state) {
    let derived = { ...state };
    
    const boatDensityFactor = state.boats / 50;
    derived.turbidity += boatDensityFactor * 8;
    derived.heavyMetalPollution += boatDensityFactor * 0.05;
    derived.plasticPollution += boatDensityFactor * 0.1;
    
    if (state.depth < 50) {
        derived.oceanTemp += boatDensityFactor * 0.5;
    }
    
    const waveEnergy = state.waveHeight * state.waveSpeed;
    derived.turbidity += waveEnergy * 0.3;
    derived.oxygen += waveEnergy * 0.4;
    
    const totalPollution = derived.plasticPollution + derived.heavyMetalPollution;
    derived.oxygen -= totalPollution;
    
    const excessNutrients = Math.max(0, (state.nitrogen - 5) + (state.phosphorus - 0.5));
    derived.oxygen -= excessNutrients * 0.3;
    derived.turbidity += excessNutrients * 0.2;
    
    derived.pH = 8.2 - (Math.log(derived.co2 / 400) / Math.log(2)) * 0.4;
    
    return derived;
}

function calculatePlanktonGrowthRate(state) {
    const tempOptimal = 18;
    const tempRange = 12;
    const tempFactor = Math.exp(-Math.pow(state.oceanTemp - tempOptimal, 2) / (2 * Math.pow(tempRange, 2)));
    
    const nHalfSat = 5;
    const pHalfSat = 0.5;
    const nLimitation = state.nitrogen / (state.nitrogen + nHalfSat);
    const pLimitation = state.phosphorus / (state.phosphorus + pHalfSat);
    const nutrientFactor = Math.min(nLimitation, pLimitation);
    
    const lightFactor = (state.sunlightIntensity / 5) * Math.exp(-state.sunlightIntensity / 25);
    
    const pHFactor = Math.exp(-Math.pow(state.pH - 8.2, 2) / 3);
    
    const turbidityFactor = Math.exp(-0.05 * state.turbidity);
    
    let growth = 65 * tempFactor * nutrientFactor * lightFactor * pHFactor * turbidityFactor;
    
    if (state.oxygen < 2) {
        growth *= sigmoid(state.oxygen, 1, 2);
    }
    
    return Math.max(0, Math.min(100, growth));
}

function calculateFishPopulation(state, planktonGrowth) {
    const carryingCapacity = 15000 * (planktonGrowth / 100);
    
    const populationPressure = (state.fishingDensity / 150) + (state.plasticPollution / 8) + 
                              (state.heavyMetalPollution * 10);
    
    const tempTolerance = Math.exp(-Math.pow(state.oceanTemp - 15, 2) / (2 * Math.pow(12, 2)));
    
    const oxygenFactor = sigmoid(state.oxygen, 3, 1.5);
    
    let population = carryingCapacity * (1 - populationPressure) * tempTolerance * oxygenFactor;
    
    if (state.oxygen < 1) population *= 0.1;
    if (state.pH < 6 || state.pH > 9) population *= 0.2;
    
    return Math.floor(Math.max(0, population));
}

function calculateCoralHealth(state) {
    const tempStress = state.oceanTemp > 29 ? 
        Math.pow(1.3, state.oceanTemp - 29) * 12 : 
        state.oceanTemp < 23 ? 
            Math.pow(1.2, 23 - state.oceanTemp) * 6 : 0;
    
    const acidificationImpact = state.pH < 7.8 ? 
        Math.pow(1.5, 7.8 - state.pH) * 20 : 0;
    
    const pollutionImpact = Math.pow(state.plasticPollution + state.heavyMetalPollution * 8, 1.3);
    
    let health = 100 - tempStress - acidificationImpact - pollutionImpact;
    
    const turbidityImpact = (state.turbidity / 100) * Math.exp(-state.depth / 1000) * 40;
    health -= turbidityImpact;
    
    if (state.oxygen < 4) {
        health -= Math.pow(4 - state.oxygen, 2) * 3;
    }
    
    if (state.depth < 50) {
        health -= (state.boats / 50) * Math.exp(-state.depth / 10) * 20;
    }
    
    return Math.max(0, Math.min(100, health));
}

function calculateSeaGrassCoverage(state) {
    const lightAtDepth = state.sunlightIntensity * Math.exp(-0.15 * state.depth);
    
    const nutrientOptimal = 12;
    const nutrientTotal = state.nitrogen + state.phosphorus;
    const nutrientFactor = Math.exp(-Math.pow(nutrientTotal - nutrientOptimal, 2) / (2 * Math.pow(8, 2)));
    
    const disturbance = (state.waveHeight * state.waveSpeed / 40) + (state.boats / 25);
    
    let coverage = 100 * sigmoid(lightAtDepth, 0.5, 3) * nutrientFactor * Math.exp(-0.15 * disturbance);
    
    if (state.pH < 7) coverage *= 0.5;
    if (state.heavyMetalPollution > 0.5) coverage *= 0.4;
    
    return Math.max(0, Math.min(100, coverage));
}

function calculateAlgalBloomRisk(state) {
    const tempFactor = Math.exp((state.oceanTemp - 20) / 12);
    
    const nutrientFactor = Math.pow(state.nitrogen * state.phosphorus, 0.4);
    
    const lightFactor = state.sunlightIntensity * (1 - Math.exp(-state.turbidity / 15));
    
    let risk = 30 * tempFactor * (nutrientFactor / 12) * lightFactor;
    
    if (state.oxygen > 8) risk *= 0.7;
    if (state.depth > 100) risk *= 0.5;
    
    return Math.max(0, Math.min(100, risk));
}

function calculateMarineMammals(state, fishPopulation) {
    const carryingCapacity = fishPopulation / 75;
    
    const noiseFactor = Math.exp(-0.03 * state.boats);
    
    const pollutionFactor = Math.exp(-(state.plasticPollution + state.heavyMetalPollution * 15));
    
    let population = carryingCapacity * noiseFactor * pollutionFactor;
    
    if (state.oxygen < 2) population *= 0.2;
    
    return Math.max(0, Math.floor(population));
}

function calculateDeadzoneArea(state) {
    const oxygenDepletion = Math.max(0, 2 - state.oxygen) * 15;
    
    const eutrophication = Math.pow(state.nitrogen * state.phosphorus, 0.6);
    
    const tempFactor = Math.exp((state.oceanTemp - 20) / 12);
    
    let area = (oxygenDepletion + eutrophication) * tempFactor;
    
    if (state.waveHeight > 2) area *= 0.6;
    if (state.depth < 50) area *= 0.4;
    
    return Math.max(0, Math.min(100, area));
}

function sigmoid(x, midpoint, steepness) {
    return 1 / (1 + Math.exp(-steepness * (x - midpoint)));
}

function updateSimulationState() {
    const derived = calculateDerivedConditions(simulationState);
    
    const planktonGrowth = calculatePlanktonGrowthRate(derived);
    const fishPop = calculateFishPopulation(derived, planktonGrowth);
    const coralHealth = calculateCoralHealth(derived);
    const seaGrass = calculateSeaGrassCoverage(derived);
    const algalBloom = calculateAlgalBloomRisk(derived);
    const oilImpact = Math.pow(derived.boats / 50, 1.2) * 100;
    const runoff = Math.pow((derived.nitrogen + derived.phosphorus) / 60, 1.1) * 100;
    const oceanAcidification = derived.pH;
    const marineMammals = calculateMarineMammals(derived, fishPop);
    const deadzoneArea = calculateDeadzoneArea(derived);

    document.getElementById('simPlanktonGrowthRate').textContent = `${planktonGrowth.toFixed(1)}%`;
    document.getElementById('simFishPopulation').textContent = `${fishPop.toLocaleString()} individuals`;
    document.getElementById('simCoralHealth').textContent = `${coralHealth.toFixed(1)}%`;
    document.getElementById('simSeaGrass').textContent = `${seaGrass.toFixed(1)}%`;
    document.getElementById('simAlgalBloomRisk').textContent = `${algalBloom.toFixed(1)}%`;
    document.getElementById('simOilSpill').textContent = `${oilImpact.toFixed(1)}%`;
    document.getElementById('simRunoff').textContent = `${runoff.toFixed(1)}%`;
    document.getElementById('simOceanAcidification').textContent = oceanAcidification.toFixed(2);
    document.getElementById('simMarineMammals').textContent = `${marineMammals.toLocaleString()} individuals`;
    document.getElementById('simDeadZoneArea').textContent = `${deadzoneArea.toFixed(1)}%`;
}