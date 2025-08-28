document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chat-window");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    // Adiciona a mensagem de boas-vindas inicial
    addMessageToChat("bot", "Olá! Sou o assistente virtual da faculdade. Em que posso ajudar?");

    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleUserMessage();
        }
    });

    sendBtn.addEventListener("click", handleUserMessage);

    function handleUserMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        addMessageToChat("user", message);
        userInput.value = "";

        setTimeout(() => {
            findResponseOnServer(message); // Nova função que busca no servidor
        }, 500);
    }

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message", `${sender}-message`);
        messageElement.innerHTML = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // NOVA FUNÇÃO PARA BUSCAR RESPOSTA NO BACKEND
    async function findResponseOnServer(userMessage) {
        try {
            // Chama a nossa API backend passando a mensagem do usuário como parâmetro 'q'
            const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(userMessage)}`);
            
            if (!response.ok) {
                // Se a resposta da API não for de sucesso, exibe um erro
                throw new Error(`Erro na API: ${response.statusText}`);
            }

            const data = await response.json(); // Converte a resposta em JSON

            addMessageToChat("bot", data.response); // Exibe a resposta do servidor

            // Se o servidor enviou uma ação, executa
            if (data.action) {
                handleAction(data.action);
            }
        } catch (error) {
            console.error("Falha ao buscar resposta:", error);
            addMessageToChat("bot", "Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.");
        }
    }

    function handleAction(actionName) {
        if (actionName === "generate_document_form") {
            const formHtml = `
                <div class="form-container">
                    <input type="text" id="form-name" placeholder="Seu Nome Completo">
                    <input type="text" id="form-ra" placeholder="Seu RA (Registro Acadêmico)">
                    <button onclick="submitDocumentForm()">Gerar Declaração</button>
                </div>
            `;
            addMessageToChat("bot", formHtml);
        }
    }

    window.submitDocumentForm = function() {
        const name = document.getElementById("form-name").value;
        const ra = document.getElementById("form-ra").value;

        if (name === "" || ra === "") {
            addMessageToChat("bot", "Por favor, preencha todos os campos para gerar o documento.");
            return;
        }

        const successMessage = `
            <strong>Solicitação enviada!</strong><br><br>
            Nome: ${name}<br>
            RA: ${ra}<br><br>
            <em>Em um sistema real, esta solicitação seria enviada para o servidor para processamento.</em>
        `;
        addMessageToChat("bot", successMessage);
    }
});