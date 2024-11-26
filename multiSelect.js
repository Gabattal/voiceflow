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
            const {
                sections = [],
                buttons = [],
                buttonColor = '#4CAF50',
                textColor = '#0000FF',
                backgroundOpacity = 0.3,
                index = 1,
                multiselect = true,
                totalMaxSelect = 3,
            } = trace.payload;

            let totalChecked = 0;

            const updateTotalChecked = () => {
                totalChecked = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).length;

                // Désactiver les cases non cochées si la limite globale est atteinte
                if (totalMaxSelect > 0 && totalChecked >= totalMaxSelect) {
                    Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
                        if (!checkbox.checked) {
                            checkbox.disabled = true;
                        }
                    });
                } else {
                    // Réactiver les cases si la limite globale n'est pas atteinte
                    if(totalMaxSelect > 0) {
                        Array.from(container.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
                            checkbox.disabled = false;
                        });
                    }
                }
            };

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
                .title {
                    color: ${textColor} !important;
                }
            </style>
        `;

            // Création des sections avec les options
            sections.forEach((section, sectionIndex) => {
                const { maxSelect = 200 } = section; // Définir maxSelect pour chaque section
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
                        optionDiv.innerHTML = `
                            <input
                                type="${multiselect ? 'checkbox' : 'radio'}" 
                                style="display: ${multiselect ? 'block' : 'none'}" 
                                name="option-${index}" 
                                id="${section.label}-${option.name}-${sectionIndex}" 
                            />
                            <label for="${section.label}-${option.name}-${sectionIndex}">${option.name}</label>
                        `;

                        const input = optionDiv.querySelector(`input[type="${multiselect ? 'checkbox' : 'radio'}"]`);

                        // Gestion de la sélection et des actions spéciales
                        input.addEventListener('change', () => {
                            updateTotalChecked();
                            const allCheckboxes = sectionDiv.querySelectorAll('input[type="checkbox"]');
                            const checkedCount = Array.from(allCheckboxes).filter(checkbox => checkbox.checked).length;

                            if (option.action === 'all' && input.checked) {
                                // Désactiver et décocher toutes les autres cases dans cette section
                                allCheckboxes.forEach(checkbox => {
                                    if (checkbox !== input) {
                                        checkbox.disabled = true;
                                        checkbox.checked = false;
                                    }
                                });
                            } else if (option.action === 'all' && !input.checked) {
                                // Réactiver toutes les cases de cette section si décoché
                                allCheckboxes.forEach(checkbox => {
                                    checkbox.disabled = false;
                                });
                            } else if (checkedCount >= maxSelect && totalMaxSelect === 0) {
                                // Limitation par maxSelect dans cette section
                                allCheckboxes.forEach(checkbox => {
                                    if (!checkbox.checked) {
                                        checkbox.disabled = true;
                                    }
                                });
                            } else {
                                // Réactiver toutes les cases de cette section si limite non atteinte
                                if(totalMaxSelect === 0) {
                                    allCheckboxes.forEach(checkbox => {
                                        checkbox.disabled = false;
                                    });
                                }
                            }

                            // Envoi immédiat pour sélection unique
                            if (!multiselect) {
                                const selectedOption = {
                                    section: section.label,
                                    selections: [option.name],
                                };
                                console.log('Option sélectionnée, données envoyées');
                                window.voiceflow.chat.interact({
                                    type: 'complete',
                                    payload: JSON.stringify({
                                        count: 1,
                                        selections: [selectedOption],
                                    }),
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

            // Si `multiselect` est vrai, ajoutez les boutons
            if (multiselect) {
                // Créer un conteneur pour les boutons
                const buttonContainer = document.createElement('div');
                buttonContainer.setAttribute('data-index', index); // Ajouter un attribut pour identifier ce conteneur
                buttonContainer.style.display = 'flex';
                buttonContainer.style.justifyContent = 'center'; // Centre les boutons
                buttonContainer.style.gap = '10px'; // Espacement entre les boutons
                buttonContainer.style.marginTop = '20px'; // Marges au-dessus du conteneur

                // Parcourir les boutons définis dans le payload
                buttons.forEach(button => {
                    const buttonElement = document.createElement('button');
                    buttonElement.classList.add('submit-btn');
                    buttonElement.textContent = button.text; // Texte du bouton

                    // Ajouter un événement "click" pour chaque bouton
                    buttonElement.addEventListener('click', () => {
                        const selectedOptions = sections.map((section, idx) => {
                            const sectionElement = container.querySelectorAll('.section-container')[idx];
                            const sectionSelections = Array.from(
                                sectionElement.querySelectorAll('input[type="checkbox"]:checked')
                            ).map(checkbox => checkbox.nextElementSibling.innerText);

                            return { section: section.label, selections: sectionSelections };
                        }).filter(section => section.selections.length > 0);

                        // Construire le payload avec le path associé au bouton cliqué
                        const jsonPayload = {
                            count: selectedOptions.reduce((sum, section) => sum + section.selections.length, 0),
                            selections: selectedOptions,
                            path: button.path, // Récupérer le path du bouton
                        };

                        console.log(`Bouton "${button.text}" cliqué, sélections envoyées`);

                        // Masquer tous les boutons dans ce conteneur
                        const currentContainer = container.querySelector(`[data-index="${index}"]`);
                        if (currentContainer) {
                            const allButtons = currentContainer.querySelectorAll('.submit-btn');
                            allButtons.forEach(btn => (btn.style.display = 'none'));
                        } else {
                            console.error(`Conteneur avec data-index="${index}" introuvable.`);
                        }

                        window.voiceflow.chat.interact({
                            type: 'complete',
                            payload: JSON.stringify(jsonPayload),
                        });
                    });

                    // Ajouter le bouton au conteneur des boutons
                    buttonContainer.appendChild(buttonElement);
                });

                // Ajouter le conteneur des boutons au conteneur principal
                container.appendChild(buttonContainer);
            }

            element.appendChild(container);
        } catch (error) {
            console.error('Erreur lors du rendu de MultiSelect:', error);
        }
    },
};
