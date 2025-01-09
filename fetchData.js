export const FetchDataWidget = {
    name: 'FetchData',
    type: 'response',
    match: ({ trace }) => {
        // Identifier si le trace correspond à ce widget
        return trace.payload && trace.type === 'fetch_data';
    },
    render: async ({ trace }) => {
        try {
            // Récupérer le payload passé depuis Voiceflow
            const { prompt_name, inputs, llm, temperature, endpoint, headers } = trace.payload;

            // Construire le payload pour l'API
            const payload = {
                prompt_name: prompt_name || "test_gabriel",
                inputs: inputs || { "question": "Combien il y a d'''habitants en France ?" },
                llm: llm || 'gpt-4o',
                temperature: temperature || 0,
                'x-token': 'cCDqMrGbeymxfs3GgSPN9pTnECoiJASdg#B4!k7r',
            };

            console.log('Payload envoyé à l’API:', payload);

            // Faire un fetch vers l'endpoint fourni dans le payload
            const targetUrl = 'https://chatinnov-api-dev--0000047.proudsky-cdf9333b.francecentral.azurecontainerapps.io/generic/langsmith/run_prompt';

            const proxifiedUrl = targetUrl;
            const response = await fetch(proxifiedUrl, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
            }

            const responseBody = await response.json();
            console.log('Réponse brute de l’API:', responseBody);

            // Retourner la réponse pour Voiceflow
            return {
                status: 'success',
                outputVars: {
                    apiResponse: responseBody, // La réponse brute
                },
            };
        } catch (error) {
            console.error('Erreur lors de l’appel API:', error);

            // Retourner une erreur
            return {
                status: 'error',
                outputVars: {
                    errorMessage: error.message,
                },
            };
        }
    },
};
