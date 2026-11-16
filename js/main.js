
let cartCount = Number(localStorage.getItem("cartCount")) || 0;
const cartLinks = document.querySelectorAll(".cart-link");

function showCart() {
    cartLinks.forEach(link => link.textContent = "Cart (" + cartCount + ")");
}
showCart();

document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", () => {
        cartCount++;
        localStorage.setItem("cartCount", cartCount);
        showCart();
        btn.textContent = "Added!";
        setTimeout(() => btn.textContent = "Add to Cart", 1000);
    });
});

cartLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        alert("You have " + cartCount + " item(s) in your cart.");
    });
});

const grid = document.querySelector(".catalog-grid");
if (grid) {
    const cards = grid.querySelectorAll(".product-card");
    const boxes = document.querySelectorAll(".filters input[type=checkbox]");
    const search = document.getElementById("search");

    function getChecked(group) {
        return [...boxes].filter(b => b.dataset.filter == group && b.checked).map(b => b.value);
    }

    function filterTeas() {
        const cats = getChecked("category");
        const formats = getChecked("format");
        const text = search.value.toLowerCase();
        let shown = 0;

        cards.forEach(card => {
            const name = card.querySelector(".product-name").textContent.toLowerCase();
            const show = (cats.length == 0 || cats.includes(card.dataset.category)) &&
                         (formats.length == 0 || formats.includes(card.dataset.format)) &&
                         name.includes(text);
            card.hidden = !show;
            if (show) shown++;
        });

        document.querySelector(".result-count").textContent = "Showing " + shown + " teas";
        document.querySelector(".no-results").hidden = shown > 0;
    }

    // footer links like tea.html?cat=black
    const cat = new URLSearchParams(location.search).get("cat");
    boxes.forEach(b => { if (b.value == cat) b.checked = true; });

    boxes.forEach(b => b.addEventListener("change", filterTeas));
    search.addEventListener("input", filterTeas);
    document.querySelector(".clear-filters").addEventListener("click", () => {
        boxes.forEach(b => b.checked = false);
        search.value = "";
        filterTeas();
    });
    filterTeas();
    if (location.hash == "#search") search.focus();
}


document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", e => {
        e.preventDefault();
        const email = form.querySelector("input").value;
        const msg = form.querySelector(".newsletter-msg");
        if (email.includes("@") && email.includes(".")) {
            msg.textContent = "Thanks for subscribing!";
            form.querySelector("input").value = "";
        } else {
            msg.textContent = "Please enter a valid email.";
        }
    });
});

const teas = {
    black:  { temp: 100, mins: 4,   tsp: 1 },
    green:  { temp: 80,  mins: 2.5, tsp: 1 },
    white:  { temp: 78,  mins: 4,   tsp: 2 },
    oolong: { temp: 90,  mins: 3.5, tsp: 1 },
    herbal: { temp: 100, mins: 5,   tsp: 1.5 }
};

const brewForm = document.getElementById("brew-form");
let timer;

if (brewForm) {
    brewForm.addEventListener("submit", e => {
        e.preventDefault();
        const type = document.getElementById("brew-type").value;
        const cups = Number(document.getElementById("brew-cups").value);
        const strength = Number(document.querySelector("input[name=strength]:checked").value);
        const name = document.getElementById("brew-name").value.trim();
        const error = document.querySelector(".form-error");

        if (type == "" || cups < 1 || cups > 12) {
            error.textContent = "Pick a tea and 1-12 cups.";
            return;
        }
        error.textContent = "";

        const tea = teas[type];
        const tsp = Math.round(tea.tsp * cups * strength * 2) / 2;
        const tempF = Math.round(tea.temp * 9 / 5 + 32);
        let seconds = Math.round(tea.mins * 60 * strength);

        document.getElementById("brew-result").innerHTML = `
            <h3>${name ? name + "'s" : "Your"} ${type} tea (${cups} cups)</h3>
            <ul class="recipe">
                <li><span>Leaf</span><strong>${tsp} tsp</strong></li>
                <li><span>Water</span><strong>${cups * 240} ml</strong></li>
                <li><span>Temperature</span><strong>${tea.temp}°C / ${tempF}°F</strong></li>
                <li><span>Steep</span><strong>${formatTime(seconds)}</strong></li>
            </ul>
            <div class="timer">
                <span id="timer-display">${formatTime(seconds)}</span>
                <button type="button" class="btn" id="timer-btn">Start timer</button>
            </div>`;

        // highlight the matching table row
        document.querySelectorAll(".brew-table tbody tr").forEach(row => {
            row.classList.toggle("highlight", row.dataset.type == type);
        });

        clearInterval(timer);
        document.getElementById("timer-btn").addEventListener("click", () => {
            clearInterval(timer);
            let left = seconds;
            timer = setInterval(() => {
                left--;
                document.getElementById("timer-display").textContent = left > 0 ? formatTime(left) : "Ready!";
                if (left <= 0) clearInterval(timer);
            }, 1000);
        });
    });
}

function formatTime(s) {
    const secs = s % 60;
    return Math.floor(s / 60) + ":" + (secs < 10 ? "0" : "") + secs;
}

const origins = [
    { place: "Shizuoka, Japan", lat: 34.98, lng: 138.38, teas: [["Sencha Tea Box", "sencha-tea-box.html"], ["Sencha Tea Bags", "sencha-tea-bags.html"]] },
    { place: "Fuding, Fujian, China", lat: 27.32, lng: 120.2, teas: [["Jasmine Silver Needle", "jasmine-silver-needle.html"]] },
    { place: "Wuyi Mountains, Fujian, China", lat: 27.72, lng: 117.68, teas: [["Lapsang Souchong", "lapsang-souchong.html"]] },
    { place: "Pinglin, Taiwan", lat: 24.94, lng: 121.71, teas: [["Rose Pouchong", "rose-pouchong.html"]] },
    { place: "Darjeeling, India", lat: 27.04, lng: 88.26, teas: [["Darjeeling FTGFOP", "darjeeling.html"]] },
    { place: "Assam, India", lat: 26.2, lng: 92.9, teas: [["Assam TGFOP", "assam.html"], ["Royal Blend", "royal-blend.html"]] },
    { place: "Nuwara Eliya, Sri Lanka", lat: 6.95, lng: 80.78, teas: [["Royal Blend", "royal-blend.html"]] }
];

const mapDiv = document.getElementById("tea-map");
if (mapDiv && window.L) {
    const map = L.map("tea-map", { scrollWheelZoom: false }).setView([20, 105], 3);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri",
        maxZoom: 16
    }).addTo(map);

    origins.forEach(o => {
        const links = o.teas.map(t => `<a href="${t[1]}">${t[0]}</a>`).join("<br>");
        L.circleMarker([o.lat, o.lng], { radius: 9, color: "#1b3022", fillColor: "#274c34", fillOpacity: 0.85 })
            .addTo(map)
            .bindPopup(`<strong>${o.place}</strong><br>${links}`);
    });
}
