export const FetchData = {
    name: 'FetchData',
    type: 'response',
    match: ({ trace }) => {
        // Identifier si le trace correspond à ce widget
        return trace.payload && trace.type === 'fetch_data';
    },
    render: async ({ trace }) => {
        console.log('Trace:', trace);
        try {
            // Récupérer le payload passé depuis Voiceflow
            const { prompt_name, inputs, llm, temperature, endpoint, headers, token } = trace.payload;
            console.log('Trace:', trace);
            console.log('Payload:', trace.payload);
            // Construire le payload pour l'API
            const payload = {
                prompt_name: prompt_name,
                inputs: inputs || { "question": "Combien il y a d'''habitants en France ?" },
                llm: llm || 'gpt-4o',
                temperature: temperature || 0,
                'x-token': token,
            };

            console.log('Payload envoyé à l’API:', payload);

            const corsProxy = 'https://cors-anywhere.herokuapp.com/';
            const response = await fetch(`${corsProxy}${endpoint}`, {
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
            const jsonPayload = {
                response: responseBody.response,
            };
            console.log('Réponse brute de l’API:', responseBody);

            // Retourner la réponse pour Voiceflow
            window.voiceflow.chat.interact({
                type: 'complete',
                payload: JSON.stringify(jsonPayload),
            });
        } catch (error) {
            console.error('Erreur lors de l’appel API:', error);

            // Retourner une erreur
            window.voiceflow.chat.interact({
                type: 'error',
                payload: "Erreur lors de l’appel API",
            });
        }
    },
};
