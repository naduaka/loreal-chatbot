// -----------------------------
// Global Variables
// -----------------------------

let products = [];
let filteredProducts = [];
let selectedProducts = [];
let conversationHistory = [];

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const selectedProductsContainer = document.getElementById("selectedProducts");
const clearSelectionsBtn = document.getElementById("clearSelections");
const generateRoutineBtn = document.getElementById("generateRoutine");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const rtlToggle = document.getElementById("rtlToggle");

// -----------------------------
// Load Products
// -----------------------------

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        products = await response.json();

        const saved = JSON.parse(localStorage.getItem("selectedProducts"));

        if (saved) {
            selectedProducts = saved;
        }

        filteredProducts = [...products];

        renderProducts();

        renderSelectedProducts();

    } catch (err) {

        console.error(err);

        productGrid.innerHTML =
            "<h2>Unable to load products.</h2>";
    }
}

loadProducts();

// -----------------------------
// Render Product Cards
// -----------------------------

function renderProducts() {

    productGrid.innerHTML = "";

    filteredProducts.forEach(product => {

        const selected = selectedProducts.find(p => p.id === product.id);

        const card = document.createElement("div");

        card.className =
            `product-card ${selected ? "selected" : ""}`;

        card.innerHTML = `

        <div class="product-image">

            <img src="${product.image}" alt="${product.name}">

        </div>

        <div class="product-content">

            <div class="brand">
                ${product.brand}
            </div>

            <div class="product-name">
                ${product.name}
            </div>

            <div class="category">
                ${product.category}
            </div>

            <div class="description">
                ${product.description}
            </div>

            <button class="more-btn">
                More Info
            </button>

        </div>

        `;

        // Expand Description

        card.querySelector(".more-btn")
            .addEventListener("click", e => {

                e.stopPropagation();

                card.classList.toggle("expanded");

                const btn =
                    card.querySelector(".more-btn");

                btn.textContent =
                    card.classList.contains("expanded")
                        ? "Hide Info"
                        : "More Info";

            });

        // Select Card

        card.addEventListener("click", () => {

            toggleProduct(product);

        });

        productGrid.appendChild(card);

    });

}

// -----------------------------
// Toggle Product
// -----------------------------

function toggleProduct(product) {

    const exists =
        selectedProducts.find(p => p.id === product.id);

    if (exists) {

        selectedProducts =
            selectedProducts.filter(
                p => p.id !== product.id
            );

    } else {

        selectedProducts.push(product);

    }

    localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
    );

    renderProducts();

    renderSelectedProducts();

}

// -----------------------------
// Selected Products UI
// -----------------------------

function renderSelectedProducts() {

    selectedProductsContainer.innerHTML = "";

    if (selectedProducts.length === 0) {

        selectedProductsContainer.innerHTML =
            "<p>No products selected.</p>";

        return;

    }

    selectedProducts.forEach(product => {

        const pill =
            document.createElement("div");

        pill.className = "selected-pill";

        pill.innerHTML = `

            ${product.name}

            <button data-id="${product.id}">

            ✕

            </button>

        `;

        pill.querySelector("button")
            .addEventListener("click", () => {

                selectedProducts =
                    selectedProducts.filter(
                        p => p.id !== product.id
                    );

                localStorage.setItem(
                    "selectedProducts",
                    JSON.stringify(selectedProducts)
                );

                renderProducts();

                renderSelectedProducts();

            });

        selectedProductsContainer.appendChild(pill);

    });

}

// -----------------------------
// Clear All
// -----------------------------

clearSelectionsBtn.addEventListener("click", () => {

    selectedProducts = [];

    localStorage.removeItem("selectedProducts");

    renderProducts();

    renderSelectedProducts();

});

// -----------------------------
// Search Products
// -----------------------------

searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

function filterProducts() {

    const search =
        searchInput.value.toLowerCase();

    const category =
        categoryFilter.value;

    filteredProducts = products.filter(product => {

        const matchesSearch =

            product.name.toLowerCase().includes(search)

            ||

            product.brand.toLowerCase().includes(search)

            ||

            product.description
                .toLowerCase()
                .includes(search);

        const matchesCategory =

            category === "all"

            ||

            product.category
                .toLowerCase()
                === category.toLowerCase();

        return matchesSearch && matchesCategory;

    });

    renderProducts();

}

// -----------------------------
// Chat Helpers
// -----------------------------

function addMessage(role, content) {

    const div = document.createElement("div");

    div.className =
        role === "user"
            ? "user-message"
            : "bot-message";

    div.innerHTML = content;

    chatMessages.appendChild(div);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}

function showLoading() {

    const loading =
        document.createElement("div");

    loading.className = "loading";

    loading.id = "loading";

    loading.innerHTML = `

        <span></span>
        <span></span>
        <span></span>

    `;

    chatMessages.appendChild(loading);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

function removeLoading() {

    const loading =
        document.getElementById("loading");

    if (loading) {

        loading.remove();

    }

}

// -----------------------------
// Conversation History
// -----------------------------

conversationHistory.push({

    role: "system",

    content: `
You are a professional L'Oréal beauty advisor.

Help users create routines using ONLY the products they selected.

You may answer questions about:

• Skincare
• Haircare
• Makeup
• Fragrance
• Beauty routines

Be concise.

Use bullet points when appropriate.

Recommend products only from the user's selected list unless they specifically ask for alternatives.
`

});

// -----------------------------
// Generate Routine
// -----------------------------

generateRoutineBtn.addEventListener("click", generateRoutine);

async function generateRoutine() {

    if (selectedProducts.length === 0) {

        alert("Please select at least one product.");

        return;

    }

    const productData = selectedProducts.map(product => ({

        name: product.name,

        brand: product.brand,

        category: product.category,

        description: product.description

    }));

    addMessage(
        "user",
        "Generate a personalized skincare routine."
    );

    showLoading();

    try {

        const response = await fetch(

            "YOUR_CLOUDFLARE_WORKER_URL",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    messages: [

                        ...conversationHistory,

                        {

                            role: "user",

                            content:

`Create a complete morning and evening skincare routine.

Selected Products:

${JSON.stringify(productData, null, 2)}

Requirements:

- Explain why each product belongs in the routine.

- Suggest the order of use.

- Mention products that should only be used at night if applicable.

- Keep the answer friendly.

`

                        }

                    ]

                })

            }

        );

        const data =
            await response.json();

        removeLoading();

        addMessage(
            "assistant",
            data.reply
        );

        conversationHistory.push({

            role: "assistant",

            content: data.reply

        });

    }

    catch (error) {

        removeLoading();

        addMessage(

            "assistant",

            "Something went wrong generating your routine."

        );

        console.error(error);

    }

}

// -----------------------------
// Follow-Up Chat
// -----------------------------

sendButton.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

async function sendMessage() {

    const message =
        userInput.value.trim();

    if (!message) return;

    addMessage("user", message);

    userInput.value = "";

    conversationHistory.push({

        role: "user",

        content: message

    });

    showLoading();

    try {

        const response = await fetch(

            "YOUR_CLOUDFLARE_WORKER_URL",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify({

                    messages:
                        conversationHistory

                })

            }

        );

        const data =
            await response.json();

        removeLoading();

        addMessage(

            "assistant",

            data.reply

        );

        conversationHistory.push({

            role: "assistant",

            content: data.reply

        });

    }

    catch (err) {

        removeLoading();

        addMessage(

            "assistant",

            "Unable to reach the AI."

        );

    }

}

// -----------------------------
// RTL Support
// -----------------------------

rtlToggle.addEventListener("click", () => {

    const html =
        document.documentElement;

    if (html.dir === "rtl") {

        html.dir = "ltr";

        rtlToggle.innerHTML =
            "🌍 RTL";

    }

    else {

        html.dir = "rtl";

        rtlToggle.innerHTML =
            "🌍 LTR";

    }

});

// ===========================================
// Chat Persistence
// ===========================================

function saveChatHistory() {
    localStorage.setItem(
        "conversationHistory",
        JSON.stringify(conversationHistory)
    );
}

function loadChatHistory() {

    const saved =
        localStorage.getItem("conversationHistory");

    if (!saved) return;

    conversationHistory = JSON.parse(saved);

    chatMessages.innerHTML = "";

    conversationHistory.forEach(message => {

        if (message.role === "system") return;

        addMessage(message.role, message.content);

    });

}

// ===========================================
// Save Every AI Conversation
// ===========================================

const originalPush = conversationHistory.push;

conversationHistory.push = function (...args) {

    const result =
        Array.prototype.push.apply(this, args);

    saveChatHistory();

    return result;

};

// ===========================================
// Format Markdown
// ===========================================

function formatResponse(text) {

    if (!text) return "";

    return text

        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        .replace(/\n/g, "<br>")

        .replace(/^- (.*)$/gm, "• $1");

}

// ===========================================
// Override addMessage()
// ===========================================

function addMessage(role, content) {

    const div = document.createElement("div");

    div.className =
        role === "user"
            ? "user-message"
            : "bot-message";

    div.innerHTML = formatResponse(content);

    chatMessages.appendChild(div);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

// ===========================================
// Typing Animation
// ===========================================

async function typeMessage(text) {

    const div =
        document.createElement("div");

    div.className = "bot-message";

    chatMessages.appendChild(div);

    let current = "";

    for (let i = 0; i < text.length; i++) {

        current += text[i];

        div.innerHTML =
            formatResponse(current);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

        await new Promise(resolve =>
            setTimeout(resolve, 8)
        );

    }

}

// ===========================================
// Web Search Toggle
// ===========================================

let useWebSearch = true;

function buildRequest(messages) {

    return {

        messages,

        web_search: useWebSearch

    };

}

// ===========================================
// Replace fetch body
// ===========================================

async function callAI(messages) {

    const response = await fetch(

        "YOUR_CLOUDFLARE_WORKER_URL",

        {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify(
                buildRequest(messages)
            )

        }

    );

    return await response.json();

}

// ===========================================
// Export Selected Products
// ===========================================

function exportRoutine() {

    const routine = {

        date:
            new Date().toLocaleString(),

        selectedProducts,

        conversationHistory

    };

    const blob = new Blob(

        [

            JSON.stringify(
                routine,
                null,
                2
            )

        ],

        {

            type:
                "application/json"

        }

    );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "loreal-routine.json";

    link.click();

}

// ===========================================
// Keyboard Shortcuts
// ===========================================

document.addEventListener("keydown", e => {

    if (

        e.ctrlKey &&

        e.key.toLowerCase() === "k"

    ) {

        e.preventDefault();

        searchInput.focus();

    }

});

// ===========================================
// Dark Mode Support
// ===========================================

const prefersDark =

window.matchMedia(

"(prefers-color-scheme: dark)"

);

prefersDark.addEventListener(

"change",

event => {

    document.body.classList.toggle(

        "dark",

        event.matches

    );

}

);

// ===========================================
// Restore Selections
// ===========================================

(function initSelections() {

    const saved =

        localStorage.getItem(

            "selectedProducts"

        );

    if (!saved) return;

    selectedProducts =

        JSON.parse(saved);

})();

// ===========================================
// Initial Chat Restore
// ===========================================

loadChatHistory();

// ===========================================
// Welcome Message
// ===========================================

if (conversationHistory.length === 1) {

    addMessage(

        "assistant",

`👋 Welcome to the L'Oréal AI Routine Builder!

Choose products above, then click **Generate Routine**.

You can also ask me questions about skincare, makeup, fragrance, or haircare.`

    );

}

// ===========================================
// Finished
// ===========================================

console.log(

"L'Oréal Routine Builder Loaded."

);
