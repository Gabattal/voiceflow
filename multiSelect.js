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

        const options = trace.payload;

        const container = document.createElement('div');
        container.innerHTML = `
          <style>
            .option-container { 
                margin: 16px; 
                display: flex; 
                gap: 10px;
                align-items: center;
            }
            
            .option-container input[type="checkbox"]:checked + label {
                background-color: #2e7ff1; 
                color: white;
            }
            .option-container input[type="checkbox"] {
                height: 20px;
                width: 20px;
                border-radius: 30px;
            }
            
            .option-container label {
             cursor: pointer; font-size: 0.9em; 
             background-color: rgba(0, 0, 0, 0.3); 
             border-radius: 5px;
             padding: 6px;
             color: white;
             user-select: none;
            }
            .submit-btn { background: #2e7ff1; color: white; padding: 10px; border-radius: 5px; cursor: pointer; border: none; }
          </style>
        `;

        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option-container');
            optionDiv.innerHTML = `<input type="checkbox" id="${option.name}" /> <label for="${option.name}">${option.name}</label>`;
            container.appendChild(optionDiv);
        });

        const submitBtn = document.createElement('button');
        submitBtn.classList.add('submit-btn');
        submitBtn.textContent = 'Valider';

        submitBtn.addEventListener('click', () => {
            const selectedOptions = Array.from(container.querySelectorAll('input[type="checkbox"]:checked')).map(
                checkbox => checkbox.nextElementSibling.innerText
            );

            const jsonPayload = {
                count: selectedOptions.length,
                name: selectedOptions
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
