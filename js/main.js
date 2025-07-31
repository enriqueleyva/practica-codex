// ======== Configuración =========
const API_BASE = "https://pokeapi.co/api/v2";
const LIMIT = 50; // Número de Pokémon a mostrar

let allPokemon = [];
let displayedPokemon = [];


document.addEventListener("DOMContentLoaded", init);

async function init() {
        try {
                await loadTypes();

                // 1. Obtiene la lista base de Pokémon (nombre + URL de detalle)
                const listResponse = await fetch(`${API_BASE}/pokemon?limit=${LIMIT}`);
                const listData = await listResponse.json();

                // 2. Para cada Pokémon, solicita sus datos detallados en paralelo
                const detailPromises = listData.results.map((p) =>
                        fetch(p.url).then((r) => r.json())
                );
                allPokemon = await Promise.all(detailPromises);

                // 3. Renderiza las tarjetas
                renderPokemon(allPokemon);

                const btn = document.getElementById("downloadPdfBtn");
                if (btn) {
                        btn.addEventListener("click", downloadPDF);
                }

        } catch (err) {
                console.error(err);
                document.getElementById(
                        "pokedex"
                ).innerHTML = `<p class="text-danger">Error al cargar los datos de la PokéAPI.</p>`;
        }
}

// ========= Helpers =========
function createPokemonCard(pokemon) {
	// Obtiene sprite oficial (front_default) y tipos
	const imgSrc =
		pokemon.sprites.other["official-artwork"].front_default ||
		pokemon.sprites.front_default ||
		"https://via.placeholder.com/180?text=No+Image";

	const types = pokemon.types
		.map(
			(t) =>
				`<span class="badge bg-secondary me-1">${capitalize(
					t.type.name
				)}</span>`
		)
		.join("");

	// Crea la estructura de la tarjeta Bootstrap
	const col = document.createElement("div");
	col.className = "col-12 col-sm-6 col-md-4 col-lg-3";

	col.innerHTML = `
        <div class="card shadow-sm h-100">
          <img src="${imgSrc}" class="card-img-top" alt="${pokemon.name}" />
          <div class="card-body">
            <h5 class="card-title text-capitalize">${pokemon.name}</h5>
            <p class="card-text mb-1"><strong>ID:</strong> #${pokemon.id
							.toString()
							.padStart(3, "0")}</p>
            <p class="card-text mb-0"><strong>Tipo(s):</strong><br/>${types}</p>
          </div>
        </div>
      `;

        return col;
}

function renderPokemon(list) {
        const pokedex = document.getElementById("pokedex");
        pokedex.innerHTML = "";
        list.forEach((pokemon) => pokedex.appendChild(createPokemonCard(pokemon)));
        displayedPokemon = list;
}

async function loadTypes() {
        const select = document.getElementById("typeFilter");
        if (!select) return;

        try {
                const res = await fetch(`${API_BASE}/type`);
                const data = await res.json();
                data.results.forEach((type) => {
                        const option = document.createElement("option");
                        option.value = type.name;
                        option.textContent = capitalize(type.name);
                        select.appendChild(option);
                });

                select.addEventListener("change", () => {
                        const selected = select.value;
                        if (selected === "all") {
                                renderPokemon(allPokemon);
                        } else {
                                const filtered = allPokemon.filter((p) =>
                                        p.types.some((t) => t.type.name === selected)
                                );
                                renderPokemon(filtered);
                        }
                });
        } catch (err) {
                console.error("Error al cargar tipos", err);
        }
}

function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
}

function downloadPDF() {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
                console.error("jsPDF no cargado");
                return;
        }

        const doc = new jsPDF();
        let y = 10;

        displayedPokemon.forEach((p, idx) => {
                const line = `${capitalize(p.name)} (#${p.id.toString().padStart(3, "0")}) - ${p.types
                        .map((t) => capitalize(t.type.name))
                        .join(", ")}`;

                if (y > 280) {
                        doc.addPage();
                        y = 10;
                }
                doc.text(line, 10, y);
                y += 10;
        });

        doc.save("pokemon.pdf");
}
