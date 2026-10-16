(() => {
    'use strict';

    // Mesmas regras da classe PetMachine.java
    const MAX_WATER = 30;
    const MAX_SHAMPOO = 10;
    const WATER_PER_USE = 10;
    const SHAMPOO_PER_USE = 2;
    const REFILL_STEP = 2;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PHASE_MS = reduceMotion ? 500 : 3000;
    const WASH_MS = reduceMotion ? 500 : 3200;
    const EXIT_MS = reduceMotion ? 0 : 900;

    // phase: idle | waiting | soaping | rinsing | clean | washing
    const state = {
        clean: true,
        water: MAX_WATER,
        shampoo: 0,
        pet: null,
        busy: false,
        phase: 'idle',
    };

    const $ = (id) => document.getElementById(id);
    const cabin = $('cabin');
    const phasesEl = $('phases');
    const phaseItems = [...phasesEl.querySelectorAll('li')];
    const logEl = $('log');
    const nameInput = $('pet-name');
    const buttons = [...document.querySelectorAll('button')];

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // bolhas do shampoo
    (function createBubbles() {
        const bubbles = $('bubbles');
        const ns = 'http://www.w3.org/2000/svg';
        for (let i = 0; i < 22; i++) {
            const c = document.createElementNS(ns, 'circle');
            c.setAttribute('class', 'bubble');
            c.setAttribute('cx', (70 + Math.random() * 260).toFixed(1));
            c.setAttribute('cy', '326');
            c.setAttribute('r', (6 + Math.random() * 10).toFixed(1));
            c.style.setProperty('--d', (2.2 + Math.random() * 1.8).toFixed(2) + 's');
            c.style.setProperty('--delay', (-Math.random() * 3).toFixed(2) + 's');
            c.style.setProperty('--sway', (Math.random() * 40 - 20).toFixed(0) + 'px');
            bubbles.appendChild(c);
        }
    })();

    // ---------- log de ações ----------

    function log(message, tone = 'ok') {
        const empty = logEl.querySelector('.log-empty');
        if (empty) empty.remove();
        const li = document.createElement('li');
        li.textContent = message;
        li.dataset.tone = tone;
        li.classList.add('new');
        logEl.prepend(li);
        while (logEl.children.length > 6) logEl.lastElementChild.remove();
    }

    // ---------- regras ----------

    function hasEnoughSupplies() {
        if (state.water < WATER_PER_USE) {
            log('Água insuficiente na máquina', 'warn');
            return false;
        }
        if (state.shampoo < SHAMPOO_PER_USE) {
            log('Shampoo insuficiente na máquina', 'warn');
            return false;
        }
        return true;
    }

    function setPet(name) {
        if (!state.clean) {
            log('A máquina está suja. Limpe a máquina antes de colocar o pet', 'warn');
            return false;
        }
        if (state.pet) {
            log(`Já tem o pet ${state.pet.name} na máquina`, 'warn');
            return false;
        }
        state.pet = { name, clean: false };
        state.phase = 'waiting';
        render();
        log(`O pet ${name} foi colocado na máquina`);
        return true;
    }

    async function takeBath() {
        if (!state.pet) return log('Não tem pet na máquina', 'warn');
        if (state.pet.clean) return log(`O pet ${state.pet.name} já está limpo. Retire-o da máquina`, 'warn');
        if (!hasEnoughSupplies()) return;

        state.busy = true;
        state.water -= WATER_PER_USE;
        state.shampoo -= SHAMPOO_PER_USE;

        state.phase = 'soaping';
        render(PHASE_MS);
        log(`Ensaboando o pet ${state.pet.name}`);
        await wait(PHASE_MS);

        state.phase = 'rinsing';
        render(PHASE_MS);
        log('Enxaguando');
        await wait(PHASE_MS);

        state.pet.clean = true;
        state.phase = 'clean';
        state.busy = false;
        render();
        log(`O pet ${state.pet.name} está limpo`);
    }

    function addWater() {
        if (state.water >= MAX_WATER) return log('A capacidade de água da máquina está no máximo', 'warn');
        state.water = Math.min(MAX_WATER, state.water + REFILL_STEP);
        render();
        log(`Água abastecida: ${state.water} de ${MAX_WATER} litros`);
    }

    function addShampoo() {
        if (state.shampoo >= MAX_SHAMPOO) return log('A capacidade de shampoo da máquina está no máximo', 'warn');
        state.shampoo = Math.min(MAX_SHAMPOO, state.shampoo + REFILL_STEP);
        render();
        log(`Shampoo abastecido: ${state.shampoo} de ${MAX_SHAMPOO} litros`);
    }

    async function removePet() {
        if (!state.pet) return log('Não tem pet na máquina', 'warn');
        const { name, clean } = state.pet;
        // se o pet sai sujo, ele deixa a máquina suja
        state.clean = clean;
        state.pet = null;
        state.phase = 'idle';
        state.busy = true;
        render();
        log(`O pet ${name} foi retirado da máquina`);
        if (!clean) log('A máquina ficou suja. Limpe antes do próximo pet', 'warn');
        await wait(EXIT_MS);
        state.busy = false;
        render();
    }

    async function wash() {
        if (state.pet) return log('Retire o pet antes de limpar a máquina', 'warn');
        if (!hasEnoughSupplies()) return;

        state.busy = true;
        state.water -= WATER_PER_USE;
        state.shampoo -= SHAMPOO_PER_USE;
        state.phase = 'washing';
        render();
        log('Limpando a máquina');
        await wait(WASH_MS);

        state.clean = true;
        state.phase = 'idle';
        state.busy = false;
        render();
        log('A máquina está limpa');
    }

    // ---------- tela ----------

    const STEPS = {
        waiting: { done: 0, running: -1, current: 1 },
        soaping: { done: 0, running: 1, current: -1 },
        rinsing: { done: 1, running: 2, current: -1 },
        clean: { done: 3, running: -1, current: 4 },
    };

    function displayText() {
        switch (state.phase) {
            case 'waiting': return 'Pet na máquina';
            case 'soaping': return 'Ensaboando…';
            case 'rinsing': return 'Enxaguando…';
            case 'clean': return 'Pet limpo';
            case 'washing': return 'Limpando a máquina…';
            default: return state.clean ? 'Pronta' : 'Precisa de limpeza';
        }
    }

    function bathsLeftText() {
        const needWater = state.water < WATER_PER_USE;
        const needShampoo = state.shampoo < SHAMPOO_PER_USE;
        if (needWater && needShampoo) return 'Abasteça água e shampoo para dar banho.';
        if (needWater) return 'Abasteça a água para dar banho.';
        if (needShampoo) return 'Abasteça o shampoo para dar banho.';
        const n = Math.min(Math.floor(state.water / WATER_PER_USE), Math.floor(state.shampoo / SHAMPOO_PER_USE));
        return `Dá para ${n} banho${n === 1 ? '' : 's'} com o que tem na máquina.`;
    }

    function setGauge(prefix, value, max, label) {
        $(`${prefix}-fill`).style.width = `${(value / max) * 100}%`;
        $(`${prefix}-meter`).setAttribute('aria-valuenow', String(value));
        $(`${prefix}-text`).textContent = `${value} de ${max} litros`;
    }

    function render(phaseMs) {
        cabin.dataset.phase = state.phase;
        cabin.dataset.machine = state.clean ? 'clean' : 'dirty';
        cabin.dataset.pet = state.pet ? 'in' : 'none';
        if (state.pet) cabin.dataset.petClean = state.pet.clean ? 'true' : 'false';
        $('display-text').textContent = displayText();

        const chipMachine = $('chip-machine');
        chipMachine.textContent = state.clean ? 'Máquina limpa' : 'Máquina suja';
        chipMachine.dataset.tone = state.clean ? 'ok' : 'bad';
        const chipPet = $('chip-pet');
        chipPet.textContent = state.pet ? `${state.pet.name} na máquina` : 'Sem pet na máquina';
        chipPet.dataset.tone = state.pet ? 'ok' : 'idle';

        setGauge('water', state.water, MAX_WATER);
        setGauge('shampoo', state.shampoo, MAX_SHAMPOO);
        $('baths-left').textContent = bathsLeftText();

        if (phaseMs) phasesEl.style.setProperty('--dur', `${phaseMs}ms`);
        const s = STEPS[state.phase] || { done: -1, running: -1, current: 0 };
        phaseItems.forEach((li, i) => {
            li.className = i <= s.done ? 'done' : i === s.running ? 'running' : i === s.current ? 'current' : '';
        });

        buttons.forEach((b) => { b.disabled = state.busy; });
    }

    // ---------- eventos ----------

    $('pet-form').addEventListener('submit', (event) => {
        event.preventDefault();
        if (state.busy) return;
        const name = nameInput.value.trim();
        if (!name) {
            log('Informe o nome do pet', 'warn');
            nameInput.focus();
            return;
        }
        if (setPet(name)) nameInput.value = '';
    });

    const actions = { bath: takeBath, remove: removePet, water: addWater, shampoo: addShampoo, wash };
    document.querySelector('.actions').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button || state.busy) return;
        actions[button.dataset.action]();
    });

    render();
})();