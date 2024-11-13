export const FileUpload = {
    name: 'FileUpload',
    type: 'response',
    match: ({ trace }) => {
        console.log('Checking match for file_upload');
        console.log(trace);
        return trace.payload && trace.payload.name === 'file_upload';
    },
    render: ({ trace, element }) => {
        try {
            console.log('FileUpload extension render');
            console.log('Trace data:', trace);

            // Generate unique ID for this instance
            const uniqueId = 'fileUpload_' + Date.now();
            console.log(`File upload id: ${uniqueId}`);

            const container = document.createElement('div');
            container.innerHTML = `
                <style>
                    .upload-container {
                        padding: 20px;
                        border: 2px dashed #ccc;
                        border-radius: 5px;
                        text-align: center;
                        margin-bottom: 20px;
                        cursor: pointer;
                    }
                    .upload-container:hover {
                        border-color: #2e7ff1;
                    }
                    .upload-input {
                        display: none;
                    }
                    .upload-label {
                        display: block;
                        margin-bottom: 10px;
                        color: #666;
                    }
                    .status-container {
                        padding: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                        display: none;
                    }
                    .success {
                        background-color: #4CAF50;
                        color: white;
                    }
                    .error {
                        background-color: #f44336;
                        color: white;
                    }
                    .loading {
                        background-color: #2196F3;
                        color: white;
                    }
                    .file-link {
                        color: white;
                        text-decoration: underline;
                        word-break: break-all;
                    }
                </style>
                <div class="upload-container">
                    <input type="file" class="upload-input" id="${uniqueId}">
                    <label for="${uniqueId}" class="upload-label">
                        Cliquer pour téléverser ou glisser-déposer un fichier
                    </label>
                </div>
                <div class="status-container"></div>
            `;

            const uploadInput = container.querySelector('.upload-input');
            const statusContainer = container.querySelector('.status-container');
            const uploadContainer = container.querySelector('.upload-container');

            const showStatus = (message, type) => {
                statusContainer.textContent = message;
                statusContainer.className = 'status-container ' + type;
                statusContainer.style.display = 'block';
            };

            const handleUpload = async (file) => {
                if (!file) return;

                showStatus('Téléversement en cours...', 'loading');

                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch('https://chatinnov-api-dev.proudsky-cdf9333b.francecentral.azurecontainerapps.io/documents_upload/', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json'
                        },
                        body: formData
                    });

                    if (response.status === 200) {
                        const data = await response.json();
                        console.log('Document téléversé:', data);

                        if (data.url) {
                            statusContainer.innerHTML = `Téléversement réussi!`;
                            statusContainer.className = 'status-container success';

                            // Send the completion event with the url
                            window.voiceflow.chat.interact({
                                type: 'complete',
                                payload: JSON.stringify({
                                    success: true,
                                    url: data.url
                                }),
                            });
                        }
                    } else if (response.status === 500) {
                        throw new Error('Document upload failed');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Upload failed');
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    showStatus(`Error: ${error.message}`, 'error');

                    // Send the completion event with the error
                    window.voiceflow.chat.interact({
                        type: 'complete',
                        payload: JSON.stringify({
                            success: false,
                            error: error.message
                        }),
                    });
                }
            };

            // Handle file select
            uploadInput.addEventListener('change', (event) => {
                handleUpload(event.target.files[0]);
            });

            // Handle drag and drop
            uploadContainer.addEventListener('dragover', (event) => {
                event.preventDefault();
                uploadContainer.style.borderColor = '#2e7ff1';
            });

            uploadContainer.addEventListener('dragleave', (event) => {
                event.preventDefault();
                uploadContainer.style.borderColor = '#ccc';
            });

            uploadContainer.addEventListener('drop', (event) => {
                event.preventDefault();
                uploadContainer.style.borderColor = '#ccc';
                const file = event.dataTransfer.files[0];
                handleUpload(file);
            });

            element.appendChild(container);

        } catch (error) {
            console.error('Error in FileUpload render:', error);
        }
    },
};
