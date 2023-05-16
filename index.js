const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let totalCount = 0;

const populateTypes = async () => {
  const res = await axios.get('https://pokeapi.co/api/v2/type');
  const types = res.data.results;

  const typeSelect = $('#typeSelect');
  typeSelect.empty();

  types.forEach((type) => {
    var html = `
      <div class="pokeTypesFilter">
        <input id="${type.name}" class="typeFilter" type="checkbox" name="type" value="${type.name}">
        <label htmlfor="${type.name}" for="${type.name}">
          ${type.name}
        </label>
      </div>
    `;

    typeSelect.append(html);
  });

  // Add event listener to type checkboxes
  $('.typeFilter').on('change', function() {
    const type = $(this).val();
    if (this.checked) {
      selectedTypes.push(type);
    } else {
      const index = selectedTypes.indexOf(type);
      if (index > -1) {
        selectedTypes.splice(index, 1);
      }
    }
    filterPokemons();
  });
};

const updatePaginationDiv = (currentPage, numPages, totalCount) => {
  $('#pagination').empty();

  const maxPagesToShow = 5;
  const numPagesEachSideOfCurrentPage = 2;
  let startPage = currentPage - numPagesEachSideOfCurrentPage;
  let endPage = currentPage + numPagesEachSideOfCurrentPage;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(startPage + maxPagesToShow - 1, numPages);
  }

  if (endPage > numPages) {
    endPage = numPages;
    startPage = Math.max(endPage - (maxPagesToShow - 1), 1);
  }

  if (currentPage > 1) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">Prev</button>
    `);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = $(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
    `);

    if (i === currentPage) {
      button.addClass('current-page');
    }

    $('#pagination').append(button);
  }

  if (currentPage < numPages) {
    $('#pagination').append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
    `);
  }

  $('#pokemonCount').html(`Showing ${PAGE_SIZE} of ${totalCount} pokemons`);
};


const paginate = async (currentPage, PAGE_SIZE, pokemons, totalCount) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
    <div class="pokeCard card" pokeName=${res.data.name}  >
      <h3>${res.data.name.toUpperCase()}</h3> 
      <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
        More
      </button>
      </div>  
      `)
  })
}

const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;
  totalCount = pokemons.length;

  populateTypes();
  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(totalCount / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages, totalCount)

    // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>
        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>
        </div>
        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

    // add event listener to pagination buttons
    $('body').on('click', ".numberedButtons", async function (e) {
      currentPage = Number(e.target.value)
      paginate(currentPage, PAGE_SIZE, pokemons, totalCount)
  
      //update pagination buttons
      updatePaginationDiv(currentPage, numPages, totalCount)
    })
  
}


$(document).ready(setup)