// ======== Configuración =========
const API_BASE = "https://pokeapi.co/api/v2";
const LIMIT = 50; // Número de Pokémon a mostrar

document.addEventListener("DOMContentLoaded", init);

async function init() {
	try {
		// 1. Obtiene la lista base de Pokémon (nombre + URL de detalle)
		const listResponse = await fetch(`${API_BASE}/pokemon?limit=${LIMIT}`);
		const listData = await listResponse.json();

		// 2. Para cada Pokémon, solicita sus datos detallados en paralelo
		const detailPromises = listData.results.map((p) =>
			fetch(p.url).then((r) => r.json())
		);
		const pokemonDetails = await Promise.all(detailPromises);

		// 3. Crea las tarjetas y añádelas al DOM
		const pokedex = document.getElementById("pokedex");
		pokemonDetails.forEach((pokemon) =>
			pokedex.appendChild(createPokemonCard(pokemon))
		);
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

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
