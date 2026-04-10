document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------------------------------
       1. ANIMAÇÕES DE SCROLL (Intersection Observer)
    ------------------------------------------------------------- */
    const fadeElements = document.querySelectorAll('.fade-up');

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: remover obserever depois de animar uma vez
                // fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    /* -------------------------------------------------------------
       2. STICKY MOBILE CTA (Removido)
    ------------------------------------------------------------- */
    // A pedido do utilizador, a funcionalidade CTA sticky no mobile foi removida para melhorar a experiência.

    /* -------------------------------------------------------------
       3. LÓGICA DO FORMULÁRIO MULTI-STEP
    ------------------------------------------------------------- */
    const steps = document.querySelectorAll('.form-step');
    const btnNext = document.querySelectorAll('.btn-next');
    const btnPrev = document.querySelectorAll('.btn-prev');
    const progressBar = document.getElementById('progress-bar');
    let currentStep = 0;

    function updateFormSteps() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.style.display = 'block';
                // Trigger a small reflow to allow fade in if wanted
                setTimeout(() => step.style.opacity = 1, 10);
            } else {
                step.style.display = 'none';
                step.style.opacity = 0;
            }
        });

        // Update progress bar
        const progressPercentage = ((currentStep + 1) / steps.length) * 100;
        if (progressBar) {
            progressBar.style.width = progressPercentage + '%';
        }
    }

    function validateStep(index) {
        const currentStepEl = steps[index];
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        let isValid = true;

        // Remove alertas antigos
        currentStepEl.querySelectorAll('.error-msg').forEach(el => el.remove());

        // Validate text/tel/textarea
        requiredInputs.forEach(input => {
            if (!input.value.trim() && (input.type === 'text' || input.type === 'tel' || input.tagName.toLowerCase() === 'textarea')) {
                isValid = false;
                input.style.borderColor = 'var(--error)';
            } else {
                input.style.borderColor = '';
            }
        });

        // Validate Radio Groups
        const radioGroups = currentStepEl.querySelectorAll('.radio-group');
        radioGroups.forEach(group => {
            // Se houver um required no primeiro input ou se soubermos que é obrigatório
            const radios = group.querySelectorAll('input[type="radio"]');
            if (radios.length > 0) {
                // assume obrigatorio
                let checked = false;
                radios.forEach(r => { if (r.checked) checked = true; });
                if (!checked) {
                    isValid = false;
                    group.style.border = '1px solid var(--error)';
                    group.style.padding = '10px';
                } else {
                    group.style.border = 'none';
                    group.style.padding = '0';
                }
            }
        });

        // Checkbox groups (pelo menos 1)
        const checkGroups = currentStepEl.querySelectorAll('.checkbox-group');
        checkGroups.forEach(group => {
            const checks = group.querySelectorAll('input[type="checkbox"]');
            if (checks.length > 0) {
                let checked = false;
                checks.forEach(c => { if (c.checked) checked = true; });
                if (!checked) {
                    isValid = false;
                    group.style.border = '1px solid var(--error)';
                    group.style.padding = '10px';
                } else {
                    group.style.border = 'none';
                    group.style.padding = '0';
                }
            }
        });

        if (!isValid) {
            const errorMsg = document.createElement('p');
            errorMsg.className = 'error-msg mt-2';
            errorMsg.style.color = 'var(--error)';
            errorMsg.style.fontSize = '0.9rem';
            errorMsg.textContent = 'Por favor, preenche todos os campos obrigatórios desta secção.';
            currentStepEl.appendChild(errorMsg);
        }

        return isValid;
    }

    btnNext.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                if (currentStep >= steps.length) currentStep = steps.length - 1;
                updateFormSteps();
            }
        });
    });

    btnPrev.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            if (currentStep < 0) currentStep = 0;
            updateFormSteps();
        });
    });

    /* -------------------------------------------------------------
       4. OUTRA ÁREA DE ACTUAÇÃO TEXT REVEAL
    ------------------------------------------------------------- */
    const areaRadios = document.querySelectorAll('input[name="area"]');
    const areaOutraDesc = document.getElementById('area-outra-text');

    areaRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Outra' && e.target.checked) {
                areaOutraDesc.style.display = 'block';
                areaOutraDesc.setAttribute('required', 'true');
            } else {
                areaOutraDesc.style.display = 'none';
                areaOutraDesc.removeAttribute('required');
                areaOutraDesc.value = ''; // clean
            }
        });
    });

    /* -------------------------------------------------------------
       5. CAPTURAR UTMs
    ------------------------------------------------------------- */
    const urlParams = new URLSearchParams(window.location.search);
    const utms = ['utm_source', 'utm_medium', 'utm_campaign'];
    utms.forEach(utm => {
        if (urlParams.has(utm)) {
            const input = document.getElementById(utm);
            if (input) input.value = urlParams.get(utm);
        }
    });

    /* -------------------------------------------------------------
       6. SUBMISSÃO DO FORMULÁRIO
    ------------------------------------------------------------- */
    const form = document.getElementById('ci-application-form');
    const successMsg = document.getElementById('form-success');

    // Substituir pela URL real do Webhook ou Google Apps Script mais tarde
    const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz9eSbgH_X1h5u4OZyonl4R21DceQZflj2-ktyJ-HDsjB25QSD0htmhCb7VN0uw5IPExA/exec";

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!validateStep(currentStep)) return; // Validar ultima etapa também

            // UI State loading
            const btnSubmit = form.querySelector('.btn-submit');
            const btnContent = btnSubmit.querySelector('.btn-content');
            const loader = btnSubmit.querySelector('.loader');

            btnSubmit.disabled = true;
            btnContent.style.display = 'none';
            loader.style.display = 'inline-block';

            // Recolher Dados
            const formData = new FormData(form);
            const dataObj = {};

            // Customizar recolha para lidar com checkbox arrays
            formData.forEach((value, key) => {
                if (!dataObj[key]) {
                    dataObj[key] = value;
                } else {
                    // Já existe, é um array de checkboxes (ex: situacao)
                    dataObj[key] = dataObj[key] + ", " + value;
                }
            });

            // Se for area 'Outra', passar o texto
            if (dataObj.area === 'Outra') {
                dataObj.area = `Outra: ${dataObj.area_outra_desc}`;
            }

            // Adicionar timestamp
            dataObj.timestamp = new Date().toISOString();
            dataObj.referrer = document.referrer || 'Direct';

            // Envio Real via REST API (Google Apps Script / Webhook)
            fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors', // Fundamental para enviar form data nativo p/ Google Script
                headers: {
                    'Content-Type': 'text/plain' // evita problemas de preflight CORS no script
                },
                body: JSON.stringify(dataObj)
            })
                .then(() => {
                    form.style.display = 'none';
                    successMsg.style.display = 'block';
                    successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
                })
                .catch(error => {
                    console.error("Erro no formulário:", error);
                    alert("Verificou-se um erro de ligação. Por favor, verifica a tua internet e tenta novamente.");
                    btnSubmit.disabled = false;
                    btnContent.style.display = 'block';
                    loader.style.display = 'none';
                });
        });
    }

});
