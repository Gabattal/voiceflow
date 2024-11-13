export const MultiSelect = {
    name: 'MultiSelect',
    type: 'response',
    match: ({ trace }) => {
        return trace.payload && trace.type === 'multi_select';
    },
    render: ({ trace, element }) => {
        try {
            // Récupérer les données depuis le payload
            const { sections = [], buttonText = 'Valider', buttonColor = '#2e7ff1', textColor = '#FFFFFF', backgroundOpacity = 0.3 } = trace.payload;

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
                        color: ${textColor}; /* Utiliser la couleur du texte depuis JSON */
                        background-color: rgba(0, 0, 0, ${backgroundOpacity}); /* Utiliser l'opacité depuis JSON */
                        user-select: none;
                    }
                    .submit-btn {
                        background: ${buttonColor}; /* Utiliser la couleur du bouton depuis JSON */
                        color: white;
                        padding: 10px;
                        border-radius: 5px;
                        cursor: pointer;
                        border: none;
                    }
                    .disabled {
                        opacity: 0.5;
                        pointer-events: none;
                    }
                </style>
            `;

            // Création des sections avec les options
            sections.forEach(section => {
                const sectionDiv = document.createElement('div');
                sectionDiv.classList.add('section-container');
                sectionDiv.style.backgroundColor = section.color;

                const sectionLabel = document.createElement('h3');
                sectionLabel.textContent = section.label;
                sectionDiv.appendChild(sectionLabel);

                if (Array.isArray(section.options)) {
                    section.options.forEach(option => {
                        const optionDiv = document.createElement('div');
                        optionDiv.classList.add('option-container');
                        optionDiv.innerHTML = `<input type="checkbox" id="${section.label}-${option.name}" /> <label for="${section.label}-${option.name}">${option.name}</label>`;

                        const checkbox = optionDiv.querySelector('input[type="checkbox"]');

                        // Gérer les actions sur les options
                        checkbox.addEventListener('change', () => {
                            if (option.action === "all" && checkbox.checked) {
                                // Désactive toutes les autres cases dans cette section
                                const checkboxes = sectionDiv.querySelectorAll('input[type="checkbox"]');
                                checkboxes.forEach(cb => {
                                    if (cb !== checkbox) {
                                        cb.checked = false;
                                        cb.disabled = true;
                                        cb.parentNode.classList.add('disabled');
                                    }
                                });
                            } else if (option.action === "all" && !checkbox.checked) {
                                // Réactive les autres cases si "all" est décoché
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

            // Créer et configurer le bouton de soumission
            const submitBtn = document.createElement('button');
            submitBtn.classList.add('submit-btn');
            submitBtn.textContent = buttonText;

            submitBtn.addEventListener('click', () => {
                const selectedOptions = sections.map((section, index) => {
                    const sectionElement = container.querySelectorAll('.section-container')[index];
                    const sectionSelections = Array.from(
                        sectionElement.querySelectorAll('input[type="checkbox"]:checked')
                    ).map(checkbox => checkbox.nextElementSibling.innerText);

                    return { section: section.label, selections: sectionSelections };
                }).filter(section => section.selections.length > 0);

                const jsonPayload = {
                    count: selectedOptions.reduce((sum, section) => sum + section.selections.length, 0),
                    selections: selectedOptions,
                    buttonText: buttonText
                };

                window.voiceflow.chat.interact({
                    type: 'complete',
                    payload: JSON.stringify(jsonPayload),
                });
            });

            container.appendChild(submitBtn);
            element.appendChild(container);

        } catch (error) {
            console.error('Erreur lors du rendu de MultiSelect:', error);
        }
    },
};
