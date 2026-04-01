const chatBox = document.getElementById("chat-box");
const options = document.getElementById("options");

let paso = 0;
let respuestas = {};

// =======================
// MOSTRAR MENSAJES
// =======================
function agregarMensaje(texto, tipo) {
    const cont = document.createElement("div");
    cont.classList.add("message");

    const msg = document.createElement("div");

    if (tipo === "bot") {
        msg.classList.add("bot-message");
    } else {
        msg.classList.add("user-message");
    }

    msg.innerText = texto;

    cont.appendChild(msg);
    chatBox.appendChild(cont);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// =======================
// EFECTO ESCRIBIENDO (DOTS)
// =======================
function escribiendo(callback) {
    const typing = document.createElement("div");
    typing.classList.add("message");

    const dots = document.createElement("div");
    dots.classList.add("bot-message", "typing");

    dots.innerHTML = "<span></span><span></span><span></span>";

    typing.appendChild(dots);
    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    setTimeout(() => {
        chatBox.removeChild(typing);
        callback();
    }, 1200);
}

// =======================
// MOSTRAR OPCIONES (ANIMADAS)
// =======================
function mostrarOpciones(lista) {
    options.innerHTML = "";

    lista.forEach((op, i) => {
        const btn = document.createElement("button");
        btn.innerText = op;

        // animación inicial
        btn.style.opacity = "0";
        btn.style.transform = "translateY(10px)";

        setTimeout(() => {
            btn.style.transition = "all 0.3s ease";
            btn.style.opacity = "1";
            btn.style.transform = "translateY(0)";
        }, i * 150);

        btn.onclick = () => seleccionarOpcion(op);

        options.appendChild(btn);
    });
}

// =======================
// CUANDO EL USUARIO RESPONDE
// =======================
function seleccionarOpcion(opcion) {

    const botones = options.querySelectorAll("button");

    botones.forEach(btn => {
        btn.disabled = true;

        if (btn.innerText === opcion) {
            btn.style.background = "#ff9800";
            btn.style.color = "white";
        } else {
            btn.style.opacity = "0.5";
        }
    });

    setTimeout(() => {
        agregarMensaje(opcion, "user");
        options.innerHTML = "";
        avanzarFlujo(opcion);
    }, 500);
}

// =======================
// FLUJO DEL CHAT
// =======================
function avanzarFlujo(opcion) {

    if (paso === 0) {
        respuestas.tipo = opcion;
        paso++;

        escribiendo(() => {
            agregarMensaje("Buena elección 😎", "bot");
            agregarMensaje("¿Con quién planeas viajar?", "bot");

            mostrarOpciones([
                "👤 Solo",
                "❤️ Pareja",
                "👨‍👩‍👧 Familia"
            ]);
        });
    }

    else if (paso === 1) {
        respuestas.viaje = opcion;
        paso++;

        escribiendo(() => {
            agregarMensaje("Genial 🙌", "bot");
            agregarMensaje("¿Qué tan lejos quieres ir?", "bot");

            mostrarOpciones([
                "📍 Cerca",
                "🌍 No importa"
            ]);
        });
    }

    else if (paso === 2) {
        respuestas.distancia = opcion;

        escribiendo(() => {
            agregarMensaje("Estoy armando tu recomendación perfecta 🎯", "bot");
        });

        setTimeout(() => {
            escribiendo(() => {
                agregarMensaje("Listo ✨ mira estas opciones para ti:", "bot");

                // AQUÍ luego conectamos con BD
                agregarMensaje("🔎 Basado en tu elección: " + respuestas.tipo, "bot");

                options.innerHTML = "";
            });
        }, 1500);
    }
}

// =======================
// INICIO DEL CHAT
// =======================
function iniciarChat() {

    agregarMensaje("Hola 👋", "bot");

    setTimeout(() => {
        agregarMensaje("Soy tu guía de viajes por el Huila 🇨🇴", "bot");
    }, 800);

    setTimeout(() => {
        agregarMensaje("Estoy contigo para ayudarte a encontrar el lugar perfecto ✨", "bot");
    }, 1600);

    setTimeout(() => {
        agregarMensaje("Cuéntame… ¿qué tipo de experiencia te gustaría?", "bot");

        mostrarOpciones([
            "⛰️ Aventura",
            "🏛️ Cultural",
            "🌿 Relajación"
        ]);

    }, 2400);
}

// =======================
// EJECUTAR
// =======================
iniciarChat();