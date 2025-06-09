// Převzato z puvodni_index.html <script> bloku, modularizováno
// Veškerá logika, eventy, fetch, validace, modální okno atd. z puvodni_index.html

const scriptURL = 'https://script.google.com/macros/s/AKfycbwuwIUAj5XdHMEpmfc6dzWIwQ9GSlwXWEAmOSvTno0L9A5641pCGIj6ABXj3RIRAEcYTA/exec';
const elements = {
    akce: document.getElementById('akce'),
    email: document.getElementById('email'),
    error: document.getElementById('email-error'),
    vyrobceContainer: document.getElementById('vyrobce-container'),
    produktGroup: document.getElementById('produkt-group'),
    produktContainer: document.getElementById('produkt-container'),
    velikostGroup: document.getElementById('velikost-group'),
    velikostContainer: document.getElementById('velikost-table-container'),
    pocetGroup: document.getElementById('pocet-group'),
    pocetOken: document.getElementById('pocet-oken'),
    successMessage: document.getElementById('success-message'),
    rozmeryInfo: document.getElementById('rozmery-info'),
    kompletaceGroup: document.getElementById('kompletace-group'),
    kompletaceSmontovany: document.getElementById('kompletace-smontovany'),
    kompletaceNesmontovany: document.getElementById('kompletace-nesmontovany'),
    sklonGroup: document.getElementById('sklon-group'),
    sklonStrechy: document.getElementById('sklon-strechy'),
    sklonValue: document.getElementById('sklon-value'),
    sklonTyp: document.getElementById('sklon-typ'),
    tloustkaGroup: document.getElementById('tloustka-group'),
    tloustkaIzolace: document.getElementById('tloustka-izolace'),
    tloustkaValue: document.getElementById('tloustka-value'),
    tloustkaMm: document.getElementById('tloustka-mm'),
    tloustkaError: document.getElementById('tloustka-error'),
    dhvGroup: document.getElementById('dhv-group'),
    dhvTiles: document.getElementById('dhv-tiles'),
    dhvError: document.getElementById('dhv-error'),
    lataGroup: document.getElementById('lata-group'),
    lataVyska: document.getElementById('lata-vyska'),
    lataMm: document.getElementById('lata-mm'),
    lataError: document.getElementById('lata-error'),
};

let selected = { vyrobce: null, produkt: null, velikost: null, kompletace: null, sklon: 30, tloustka: 200, dhv: null, lata: 40 };

function normalize(text) {
    return text.trim().toUpperCase().replace(/\s+/g, ' ');
}

function handleSelection(type, value, container, nextGroup, event) {
    selected[type] = value;
    container.querySelectorAll('.tile').forEach(tile => tile.classList.remove('selected'));
    event.target.classList.add('selected');
    if (nextGroup) nextGroup.style.display = 'block';
}

function validateEmail() {
    const email = elements.email.value.trim();
    const isValid = /^[a-zA-Z0-9._%+-]+@dek-cz\.com$/.test(email);
    elements.email.style.borderColor = isValid ? '#ddd' : 'var(--error-color)';
    elements.error.style.display = isValid ? 'none' : 'block';
    return isValid;
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    setTimeout(() => elements.error.style.display = 'none', 3000);
}

async function loadData() {
    elements.vyrobceContainer.innerHTML = '<div id="vyrobce-loading" class="loading-spinner">Načítám výrobce…</div>';
    try {
        const response = await fetch(scriptURL + '?action=getProducts');
        const data = await response.json();
        const manufacturers = {};
        Object.entries(data).forEach(([key, value]) => {
            const normalizedKey = normalize(key);
            manufacturers[normalizedKey] = {
                originalName: key,
                products: value
            };
        });
        elements.vyrobceContainer.innerHTML = '';
        Object.keys(manufacturers).sort().forEach(vyrobce => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = manufacturers[vyrobce].originalName;
            tile.onclick = (event) => {
                handleSelection('vyrobce', vyrobce, elements.vyrobceContainer, elements.produktGroup, event);
                elements.produktContainer.innerHTML = '';
                Object.keys(manufacturers[vyrobce].products).sort().forEach(produkt => {
                    const productTile = document.createElement('div');
                    productTile.className = 'tile';
                    productTile.textContent = produkt;
                    productTile.onclick = (event) => {
                        handleSelection('produkt', produkt, elements.produktContainer, elements.velikostGroup, event);
                        renderVelikostTable(manufacturers[vyrobce].products[produkt]);
                    };
                    elements.produktContainer.appendChild(productTile);
                });
            };
            elements.vyrobceContainer.appendChild(tile);
        });
    } catch (error) {
        console.error('Chyba při načítání dat:', error);
        elements.vyrobceContainer.innerHTML = '<div class="tile">Chyba při načítání dat</div>';
    }
}

function renderVelikostTable(velikosti) {
    const container = document.getElementById('velikost-table-container');
    container.innerHTML = '';
    if (!velikosti || velikosti.length === 0) return;
    const velikostiPlus = velikosti.slice();
    velikostiPlus.push({ velikost: 'individuál', vnejsi_s: '', vnejsi_d: '', vnitrni_s: '', vnitrni_d: '' });
    const cols = 5;
    let rows = Math.ceil(velikostiPlus.length / cols);
    let tbody = '<tbody>';
    for (let r = 0; r < rows; r++) {
        tbody += '<tr>';
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            if (idx < velikostiPlus.length) {
                const v = velikostiPlus[idx];
                tbody += `<td style="padding:8px;border:1px solid #ddd;cursor:pointer;" data-idx="${idx}">${v.velikost}</td>`;
            } else {
                tbody += '<td></td>';
            }
        }
        tbody += '</tr>';
    }
    tbody += '</tbody>';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="background:#f5f5f5;">
                <th colspan="${cols}" style="padding:8px;border:1px solid #ddd;">Označení</th>
            </tr>
        </thead>
        ${tbody}
    `;
    table.querySelectorAll('td[data-idx]').forEach(td => {
        td.onclick = function () {
            table.querySelectorAll('td').forEach(cell => cell.style.background = '');
            td.style.background = 'rgba(225,0,0,0.08)';
            const idx = parseInt(td.getAttribute('data-idx'));
            const vybrana = velikostiPlus[idx];
            selected.velikost = vybrana;
            elements.rozmeryInfo.style.display = 'block';
            elements.pocetGroup.style.display = 'block';
            if (vybrana.velikost === 'individuál') {
                document.getElementById('rozmery-info').innerHTML = `
                    <h3>Rozměry vybrané velikosti:</h3>
                    <div>Vnější šířka: <input type="number" id="vnejsi-s-input" min="500" max="2000" step="1" required style="width:80px;" placeholder="mm"> mm <span id="vnejsi-s-error" class="error-message" style="display:none;">Zadejte celé číslo 500–2000 mm</span></div>
                    <div>Vnější délka: <input type="number" id="vnejsi-d-input" min="500" max="2000" step="1" required style="width:80px;" placeholder="mm"> mm <span id="vnejsi-d-error" class="error-message" style="display:none;">Zadejte celé číslo 500–2000 mm</span></div>
                    <div>Vnitřní šířka ostění: <span id="vnitrni-s"></span> mm</div>
                    <div>Vnitřní délka ostění: <span id="vnitrni-d"></span> mm</div>
                `;
                const sInput = document.getElementById('vnejsi-s-input');
                const dInput = document.getElementById('vnejsi-d-input');
                const sError = document.getElementById('vnejsi-s-error');
                const dError = document.getElementById('vnejsi-d-error');
                const vnitrniS = document.getElementById('vnitrni-s');
                const vnitrniD = document.getElementById('vnitrni-d');
                function updateIndi() {
                    let s = parseInt(sInput.value, 10);
                    let d = parseInt(dInput.value, 10);
                    let validS = Number.isInteger(s) && s >= 500 && s <= 2000;
                    let validD = Number.isInteger(d) && d >= 500 && d <= 2000;
                    sError.style.display = validS || !sInput.value ? 'none' : 'block';
                    dError.style.display = validD || !dInput.value ? 'none' : 'block';
                    vnitrniS.textContent = validS ? (s - 60) : '';
                    vnitrniD.textContent = validD ? (d - 60) : '';
                    if (validS && validD) {
                        selected.velikost = {
                            velikost: 'individuál',
                            vnejsi_s: s,
                            vnejsi_d: d,
                            vnitrni_s: s - 60,
                            vnitrni_d: d - 60
                        };
                    } else {
                        selected.velikost = null;
                    }
                    updateStepsMenu();
                }
                sInput.addEventListener('input', updateIndi);
                dInput.addEventListener('input', updateIndi);
            } else {
                document.getElementById('rozmery-info').innerHTML = `
                    <h3>Rozměry vybrané velikosti:</h3>
                    <div>Vnější šířka: <span id="vnejsi-s">${vybrana.vnejsi_s}</span> mm</div>
                    <div>Vnější délka: <span id="vnejsi-d">${vybrana.vnejsi_d}</span> mm</div>
                    <div>Vnitřní šířka ostění: <span id="vnitrni-s">${vybrana.vnitrni_s}</span> mm</div>
                    <div>Vnitřní délka ostění: <span id="vnitrni-d">${vybrana.vnitrni_d}</span> mm</div>
                `;
            }
        };
    });
    container.appendChild(table);
}

async function submitForm() {
    const loadingMsg = document.getElementById('loading-message');
    if (loadingMsg) loadingMsg.style.display = 'flex';
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.disabled = true;
    const params = new URLSearchParams({
        'Název akce': elements.akce.value,
        'Firemní email': elements.email.value,
        'Výrobce': selected.vyrobce || '',
        'Produkt': selected.produkt || '',
        'Velikost': selected.velikost ? selected.velikost.velikost : '',
        'Vnější šířka': selected.velikost ? selected.velikost.vnejsi_s : '',
        'Vnější délka': selected.velikost ? selected.velikost.vnejsi_d : '',
        'Vnitřní šířka ostění': selected.velikost ? selected.velikost.vnitrni_s : '',
        'Vnitřní délka ostění': selected.velikost ? selected.velikost.vnitrni_d : '',
        'Počet oken': elements.pocetOken.value,
        'Typ kompletace': selected.kompletace || '',
        'Sklon střechy (°)': elements.sklonStrechy.value,
        'Typ sklonu': elements.sklonTyp ? elements.sklonTyp.textContent : '',
        'Tloušťka izolace (mm)': elements.tloustkaIzolace.value,
        'AKUSTIK': false,
        'Tloušťka OSB (mm)': '',
        'Tloušťka DHV (mm)': selected.dhv,
        'Výška latí/bednění (mm)': elements.lataVyska.value,
        'Výška kontralatě (mm)': selected.kontralata || ''
    });
    try {
        const response = await fetch(`${scriptURL}?${params.toString()}`);
        if (!response.ok) throw new Error('HTTP error');
        showModal('✓ Formulář byl úspěšně odeslán. Děkujeme! Výsledek Vám přijde do 1 minuty na zadaný e-mail.', true);
        setTimeout(() => {
            hideModal();
            resetForm();
            loadData();
        }, 3500);
    } catch (error) {
        showModal('Odeslání se nezdařilo. Zkuste to prosím znovu.', false);
    } finally {
        if (loadingMsg) loadingMsg.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }
}

function showModal(message, success = true) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const modalWin = document.getElementById('modal-window');
    if (!overlay || !content || !modalWin) return;
    content.innerHTML = message;
    modalWin.style.border = success ? '2px solid #00c851' : '2px solid #e10000';
    modalWin.style.background = success ? '#eaffea' : '#ffeaea';
    content.style.color = success ? '#009900' : '#e10000';
    overlay.style.display = 'flex';
}
function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

function updateStepsMenu() {
    const steps = [
        elements.akce.value.trim().length > 0,
        validateEmail(),
        !!selected.vyrobce,
        !!selected.produkt,
        !!selected.velikost,
        elements.pocetOken.value && parseInt(elements.pocetOken.value) > 0,
        !!selected.kompletace,
        elements.sklonStrechy && elements.sklonStrechy.value !== '',
        elements.tloustkaIzolace && /^\d+$/.test(elements.tloustkaIzolace.value) && elements.tloustkaIzolace.value >= 80 && elements.tloustkaIzolace.value <= 300,
        (selected.dhv === "0" || selected.dhv === "1" || selected.dhv === "2"),
        (selected.kontralata >= 40 && selected.kontralata <= 100) && elements.lataVyska && /^\d+$/.test(elements.lataVyska.value) && elements.lataVyska.value >= 20 && elements.lataVyska.value <= 100
    ];
    const stepIds = [
        'step-akce','step-mail','step-vyrobce','step-produkt','step-velikost','step-pocet','step-kompletace','step-sklon','step-tloustka','step-dhv','step-lata'
    ];
    let firstInvalid = steps.indexOf(false);
    if (firstInvalid === -1) firstInvalid = steps.length;
    for (let i = 0; i < steps.length; i++) {
        const el = document.getElementById(stepIds[i]);
        if (!el) continue;
        if (i < firstInvalid) {
            el.className = 'step completed';
        } else if (i === firstInvalid) {
            el.className = 'step active';
        } else {
            el.className = 'step';
        }
    }
    const akceError = document.getElementById('akce-error');
    if (akceError) {
        if (elements.akce.value.trim().length === 0) {
            akceError.style.display = 'block';
        } else {
            akceError.style.display = 'none';
        }
    }
    const submitBtn = document.getElementById('submit-btn');
    const allValid = steps.every(Boolean);
    if (submitBtn) {
        submitBtn.style.display = allValid ? 'block' : 'none';
    }
}

function resetForm() {
    elements.akce.value = '';
    elements.email.value = '';
    if (elements.pocetOken) elements.pocetOken.value = '';
    if (elements.tloustkaIzolace) elements.tloustkaIzolace.value = '';
    if (elements.lataVyska) elements.lataVyska.value = '';
    if (elements.kontralataVyska) elements.kontralataVyska.value = '';
    if (elements.tloustkaMm) elements.tloustkaMm.textContent = '';
    if (elements.lataMm) elements.lataMm.textContent = '';
    selected = { vyrobce: null, produkt: null, velikost: null, kompletace: null, sklon: 30, tloustka: 200, dhv: null, lata: 40 };
    elements.vyrobceContainer.innerHTML = '';
    elements.produktGroup.style.display = 'none';
    elements.velikostGroup.style.display = 'none';
    elements.rozmeryInfo.style.display = 'none';
    elements.pocetGroup.style.display = 'none';
    elements.kompletaceGroup.style.display = 'none';
    elements.sklonGroup.style.display = 'none';
    elements.tloustkaGroup.style.display = 'none';
    elements.dhvGroup.style.display = 'none';
    elements.lataGroup.style.display = 'none';
    if (elements.dhvTiles) elements.dhvTiles.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
    selected.dhv = null;
    if (elements.error) elements.error.style.display = 'none';
    if (document.getElementById('akce-error')) document.getElementById('akce-error').style.display = 'none';
    if (elements.tloustkaError) elements.tloustkaError.style.display = 'none';
    if (elements.lataError) elements.lataError.style.display = 'none';
    if (document.getElementById('vnejsi-s')) document.getElementById('vnejsi-s').textContent = '';
    if (document.getElementById('vnejsi-d')) document.getElementById('vnejsi-d').textContent = '';
    if (document.getElementById('vnitrni-s')) document.getElementById('vnitrni-s').textContent = '';
    if (document.getElementById('vnitrni-d')) document.getElementById('vnitrni-d').textContent = '';
    if (elements.sklonStrechy) elements.sklonStrechy.value = '';
    if (elements.sklonValue) elements.sklonValue.textContent = '';
    if (elements.sklonTyp) elements.sklonTyp.textContent = '';
    updateStepsMenu();
}

// Event listenery a inicializace
document.addEventListener('DOMContentLoaded', function() {
    resetForm();
    loadData();
    const overlay = document.getElementById('global-loader-overlay');
    if (overlay) {
        setTimeout(() => {
            overlay.style.transition = 'opacity 0.6s';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 600);
        }, 3500);
    }
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.onclick = hideModal;
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) hideModal();
    });
    updateStepsMenu();
    // Stepper pro počet oken
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');
    const pocetOken = document.getElementById('pocet-oken');
    if (minusBtn && plusBtn && pocetOken) {
        minusBtn.onclick = function() {
            let val = parseInt(pocetOken.value) || 1;
            if (val > 1) pocetOken.value = val - 1;
            pocetOken.dispatchEvent(new Event('input'));
        };
        plusBtn.onclick = function() {
            let val = parseInt(pocetOken.value) || 0;
            pocetOken.value = val + 1;
            pocetOken.dispatchEvent(new Event('input'));
        };
    }
    // Kontralata tiles
    const kontralataTiles = document.getElementById('kontralata-tiles');
    if (kontralataTiles) {
        kontralataTiles.querySelectorAll('.tile').forEach(tile => {
            tile.onclick = function() {
                kontralataTiles.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
                tile.classList.add('selected');
                selected.kontralata = parseInt(tile.getAttribute('data-value'), 10);
                document.getElementById('kontralata-error').style.display = 'none';
                updateStepsMenu();
            };
        });
    }
    // DHV tiles
    if (elements.dhvTiles) {
        elements.dhvTiles.querySelectorAll('.tile').forEach(tile => {
            tile.onclick = function() {
                elements.dhvTiles.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
                tile.classList.add('selected');
                selected.dhv = tile.getAttribute('data-tloustka');
                elements.dhvError.style.display = 'none';
                updateStepsMenu();
            };
            tile.addEventListener('click', function() {
                if (selected.dhv === "0" || selected.dhv === "1" || selected.dhv === "2") {
                    elements.lataGroup.style.display = 'block';
                } else {
                    elements.lataGroup.style.display = 'none';
                }
            });
        });
    }
    // Kompletace tiles
    if (elements.kompletaceSmontovany && elements.kompletaceNesmontovany) {
        elements.kompletaceSmontovany.onclick = function() {
            selected.kompletace = 'Smontovaný dílec, včetně EPS šablony';
            elements.kompletaceSmontovany.classList.add('selected');
            elements.kompletaceNesmontovany.classList.remove('selected');
            updateStepsMenu();
            if (selected.kompletace) {
                elements.sklonGroup.style.display = 'block';
            } else {
                elements.sklonGroup.style.display = 'none';
            }
        };
        elements.kompletaceNesmontovany.onclick = function() {
            selected.kompletace = 'Nesmontovaný dílec, bez EPS šablony';
            elements.kompletaceNesmontovany.classList.add('selected');
            elements.kompletaceSmontovany.classList.remove('selected');
            updateStepsMenu();
            if (selected.kompletace) {
                elements.sklonGroup.style.display = 'block';
            } else {
                elements.sklonGroup.style.display = 'none';
            }
        };
    }
    // Počet oken input
    if (elements.pocetOken) {
        elements.pocetOken.addEventListener('input', function() {
            if (elements.pocetOken.value && parseInt(elements.pocetOken.value) > 0) {
                elements.kompletaceGroup.style.display = 'block';
            } else {
                elements.kompletaceGroup.style.display = 'none';
            }
            updateStepsMenu();
        });
    }
    // Sklon input
    if (elements.sklonStrechy) {
        elements.sklonStrechy.addEventListener('input', function() {
            const val = parseInt(this.value, 10);
            const errorEl = document.getElementById('sklon-error');
            const typEl = elements.sklonTyp;
            const poznEl = document.getElementById('sklon-pozn');
            let isValid = Number.isInteger(val) && val >= 22 && val <= 65;
            if (!this.value) {
                this.classList.remove('error');
                errorEl.textContent = '';
                typEl.textContent = '';
                poznEl.style.display = 'none';
            } else if (!isValid) {
                this.classList.add('error');
                errorEl.textContent = 'Zadejte celé číslo v rozmezí 22–65.';
                typEl.textContent = '';
                poznEl.style.display = 'none';
            } else {
                this.classList.remove('error');
                errorEl.textContent = '';
                if ((val >= 22 && val <= 29) || (val >= 61 && val <= 65)) {
                    typEl.textContent = "Atypický TOPDEK okenní dílec";
                    typEl.style.color = "#E95E1D";
                    poznEl.style.display = '';
                } else {
                    typEl.textContent = "Standardní TOPDEK okenní dílec";
                    typEl.style.color = "#009900";
                    poznEl.style.display = 'none';
                }
                const sklonCaraRect = document.getElementById('sklon-cara-rect');
                if (sklonCaraRect) sklonCaraRect.setAttribute('transform', `rotate(${-val} 5 35)`);
            }
            updateStepsMenu();
            if (elements.sklonStrechy.value) {
                elements.tloustkaGroup.style.display = 'block';
            } else {
                elements.tloustkaGroup.style.display = 'none';
            }
        });
    }
    // Tloušťka izolace
    if (elements.tloustkaIzolace) {
        elements.tloustkaIzolace.addEventListener('input', function() {
            let val = elements.tloustkaIzolace.value;
            elements.tloustkaMm.textContent = val ? val : '';
            if (!/^\d+$/.test(val) || val < 80 || val > 300) {
                elements.tloustkaError.style.display = 'block';
            } else {
                elements.tloustkaError.style.display = 'none';
            }
            selected.tloustka = parseInt(val, 10) || 0;
            updateStepsMenu();
            // Zobraz DHV group pokud validní
            const tloustkaValid = elements.tloustkaIzolace && /^\d+$/.test(elements.tloustkaIzolace.value) && elements.tloustkaIzolace.value >= 80 && elements.tloustkaIzolace.value <= 300;
            if (tloustkaValid) {
                elements.dhvGroup.style.display = 'block';
            } else {
                elements.dhvGroup.style.display = 'none';
            }
        });
    }
    // Výška latí
    if (elements.lataVyska) {
        elements.lataVyska.addEventListener('input', function() {
            let val = elements.lataVyska.value;
            elements.lataMm.textContent = val ? val : '';
            if (!/^\d+$/.test(val) || val < 20 || val > 100) {
                elements.lataError.style.display = 'block';
            } else {
                elements.lataError.style.display = 'none';
            }
            selected.lata = parseInt(val, 10) || '';
            updateStepsMenu();
        });
    }
    // Email validace
    if (elements.email) {
        elements.email.addEventListener('input', () => { validateEmail(); updateStepsMenu(); });
    }
    if (elements.vyrobceContainer) elements.vyrobceContainer.addEventListener('click', updateStepsMenu);
    if (elements.produktContainer) elements.produktContainer.addEventListener('click', updateStepsMenu);
    if (elements.velikostContainer) elements.velikostContainer.addEventListener('click', updateStepsMenu);
    if (elements.akce) elements.akce.addEventListener('input', updateStepsMenu);
    document.getElementById('submit-btn').addEventListener('click', submitForm);
    // Sklon ikona update při načtení
    function updateSklonIkona() {
        const uhel = elements.sklonStrechy.value;
        elements.sklonValue && (elements.sklonValue.textContent = uhel ? (uhel + '°') : '');
        const sklonCaraRect = document.getElementById('sklon-cara-rect');
        const sklonTyp = elements.sklonTyp;
        const sklonPozn = document.getElementById('sklon-pozn');
        if (uhel) {
            if (sklonCaraRect) sklonCaraRect.setAttribute('transform', `rotate(${-uhel} 5 35)`);
            if ((uhel >= 22 && uhel < 30) || (uhel > 60 && uhel <= 65)) {
                sklonTyp.textContent = "Atypický TOPDEK okenní dílec";
                sklonTyp.style.color = "#E95E1D";
                if (sklonPozn) sklonPozn.style.display = "";
            } else {
                sklonTyp.textContent = "Standardní TOPDEK okenní dílec";
                sklonTyp.style.color = "#009900";
                if (sklonPozn) sklonPozn.style.display = "none";
            }
        } else {
            if (sklonCaraRect) sklonCaraRect.removeAttribute('transform');
            if (sklonTyp) sklonTyp.textContent = '';
            if (sklonPozn) sklonPozn.style.display = "none";
            elements.sklonValue && (elements.sklonValue.textContent = '');
        }
    }
    if (elements.sklonStrechy) {
        elements.sklonStrechy.addEventListener('input', function() {
            updateSklonIkona();
            updateStepsMenu();
        });
        updateSklonIkona();
    }
});
