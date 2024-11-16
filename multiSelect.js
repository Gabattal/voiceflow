export const MultiSelect = {
    name: 'MultiSelect',
    type: 'response',
    match: ({ trace }) => {
        return trace.payload && trace.type === 'multi_select';
    },
    render: ({ trace, element }) => {
        try {
            // Récupérer les données depuis le payload
            console.log(trace.payload);
            const { sections = [], buttonText = 'Valider', buttonColor = '#2e7ff1', textColor = '#FFFFFF', backgroundOpacity = 0.3, noneButton = false } = trace.payload;

            // Vérifier que sections est un tableau
            if (!Array.isArray(sections)) {
                console.error('Erreur : `sections` n\'est pas un tableau', sections);
                return;
            }

            const container = document.createElement('div');
            container.innerHTML = `
                <style>
                    .section-container {
                        padding: 10px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    .option-container { 
                        display: flex; 
                        align-items: center;
                        margin: 8px 0;
                    }
                    .option-container input[type="checkbox"] {
                        height: 20px;
                        width: 20px;
                        border-radius: 30px;
                        margin-right: 10px;
                    }
                    .option-container label {
                        cursor: pointer; 
                        font-size: 0.9em;
                        border-radius: 5px;
                        padding: 6px;
                        color: ${textColor};
                        background-color: rgba(0, 0, 0, ${backgroundOpacity});
                        user-select: none;
                    }
                    .submit-btn {
                        background: ${buttonColor};
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        border: none;
                    }
                    .submit-btn:hover {
                        opacity: 0.8;
                    }
                    .none-button {
                        background-color: ${buttonColor};
                        color: white;
                        padding: 10px;
                        margin-left: 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        border: none;
                    }
                    .none-button:hover {
                        opacity: 0.8;
                    }
                    .title {
                        color: ${textColor} !important;
                    }
                </style>
            `;

            // Création des sections avec les options
            sections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('section-container');
                sectionDiv.style.backgroundColor = section.color;

                const sectionLabel = document.createElement('h3');
                sectionLabel.classList.add('title');
                sectionLabel.textContent = section.label;
                sectionDiv.appendChild(sectionLabel);

                if (Array.isArray(section.options)) {
                    section.options.forEach(option => {
                        const optionDiv = document.createElement('div');
                        optionDiv.classList.add('option-container');
                        optionDiv.innerHTML = `<input type="checkbox" id="${section.label}-${option.name}" /> <label for="${section.label}-${option.name}">${option.name}</label>`;

                        const checkbox = optionDiv.querySelector('input[type="checkbox"]');

                        checkbox.addEventListener('change', () => {
                            if (option.action === "all" && checkbox.checked) {
                                const checkboxes = sectionDiv.querySelectorAll('input[type="checkbox"]');
                                checkboxes.forEach(cb => {
                                    if (cb !== checkbox) {
                                        cb.checked = false;
                                        cb.disabled = true;
                                        cb.parentNode.classList.add('disabled');
                                    }
                                });
                            } else if (option.action === "all" && !checkbox.checked) {
                                const checkboxes = sectionDiv.querySelectorAll('input[type="checkbox"]');
                                checkboxes.forEach(cb => {
                                    cb.disabled = false;
                                    cb.parentNode.classList.remove('disabled');
                                });
                            }
                        });

                        sectionDiv.appendChild(optionDiv);
                    });
                } else {
                    console.error('Erreur : `options` n\'est pas un tableau dans la section', section);
                }

                container.appendChild(sectionDiv);
            });

            // Créer et configurer le bouton principal
            const submitBtn = document.createElement('button');
            submitBtn.classList.add('submit-btn');
            submitBtn.textContent = buttonText;

            container.appendChild(submitBtn);

            submitBtn.addEventListener('click', () => {
                const selectedOptions = sections.map((section, index) => {
                    const sectionElement = container.querySelectorAll('.section-container')[index];
                    const sectionSelections = Array.from(
                        sectionElement.querySelectorAll('input[type="checkbox"]:checked')
                    ).map(checkbox => checkbox.nextElementSibling.innerText);

                    return { section: section.label, selections: sectionSelections };
                }).filter(section => section.selections.length > 0);

                if (selectedOptions.length === 0) {
                    console.log('Aucune sélection effectuée');
                    window.voiceflow.chat.interact({
                        type: 'complete',
                        payload: JSON.stringify({
                            count: 0,
                        }),
                    });
                    return;
                }

                const jsonPayload = {
                    count: selectedOptions.reduce((sum, section) => sum + section.selections.length, 0),
                    selections: selectedOptions,
                };

                console.log('Bouton principal cliqué, sélections envoyées');
                window.voiceflow.chat.interact({
                    type: 'complete',
                    payload: JSON.stringify(jsonPayload),
                });
            });

            // Bouton "Aucun" (si `noneButton` est activé)
            if (noneButton) {
                const noneButtonElement = document.createElement('button');
                noneButtonElement.classList.add('none-button');
                noneButtonElement.textContent = 'Aucun';



                noneButtonElement.addEventListener('click', () => {

                    console.log(jsonPayload);
                    window.voiceflow.chat.interact({
                        type: 'complete',
                        payload: JSON.stringify({
                            count: 0,
                        }),
                    });
                });

                container.appendChild(noneButtonElement);
            }

            element.appendChild(container);

        } catch (error) {
            console.error('Erreur lors du rendu de MultiSelect:', error);
        }
    },
};
