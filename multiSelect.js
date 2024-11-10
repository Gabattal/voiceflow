export const MultiSelect = {
    name: 'MultiSelect',
    type: 'response',
    match: ({ trace }) => {
        console.log('Checking match for multi_select');
        console.log(trace);
        return trace.type === 'multi_select' && trace.payload;
    },
    render: ({ trace, element }) => {
        console.log('MultiSelect extension render');
        console.log('Trace data:', trace);

        // Récupérer les sections et le texte du bouton depuis le payload
        const { sections, buttonText = 'Valider' } = trace.payload;

        console.log(sections.length);

        const container = document.createElement('div');
        container.innerHTML = `
          <style>
            .section-container {
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 20px;
                color: white;
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
                background-color: rgba(0, 0, 0, 0.3); 
                border-radius: 5px;
                padding: 6px;
                color: white;
                user-select: none;
            }
            .submit-btn {
                background: #2e7ff1; 
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
            sectionDiv.style.backgroundColor = section.color; // Applique la couleur de fond

            const sectionLabel = document.createElement('h3');
            sectionLabel.textContent = section.label;
            sectionDiv.appendChild(sectionLabel);

            section.options.forEach(option => {
                const optionDiv = document.createElement('div');
                optionDiv.classList.add('option-container');
                optionDiv.innerHTML = `<input type="checkbox" id="${section.label}-${option.name}" /> <label for="${section.label}-${option.name}">${option.name}</label>`;

                const checkbox = optionDiv.querySelector('input[type="checkbox"]');

                // Ajouter un écouteur pour gérer les actions
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

            container.appendChild(sectionDiv);
        });

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
                buttonText: buttonText  // Inclure le texte du bouton dans le payload
            };

            window.voiceflow.chat.interact({
                type: 'complete',
                payload: JSON.stringify(jsonPayload),
            });
        });

        container.appendChild(submitBtn);
        element.appendChild(container);
    },
};
