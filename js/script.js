const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    apiKey: API_KEY,
    apiURL: 'https://api.themoviedb.org/3/',
  },
};

// Init app
function init() {
  switch (global.currentPage) {
    case '/':
      home();
      break;
    case '/home.html':
      home();
      break;
    case '/index.html':
      home();
      break;
    case '/shows.html':
      shows();
      break;
    case '/movie-details.html':
      movieDetails();
      break;
    case '/tv-details.html':
      tvDetails();
      break;
    case '/search.html':
      search();
      break;
  }

  highlightActiveMenuItem();
}

//Highligh active menu item
function highlightActiveMenuItem() {
  const menuItems = document.querySelectorAll('.nav-link');
  menuItems.forEach((item) => {
    if (item.getAttribute('href') === global.currentPage) {
      item.classList.add('active');
    }
  });
}

function home() {
  displayPopularMovies();
  displaySlider();
}

function shows() {
  displayPopularShows();
}

function movieDetails() {
  displayMovieDetails();
}

function tvDetails() {
  displayShowDetails();
}

async function search() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  global.search.term = urlParams.get('search-term');
  global.search.type = urlParams.get('type');

  if (global.search.term !== '' && global.search.type !== '') {
    const { results, total_pages, page, total_results } = await searchAPIData();

    if (results.length === 0) {
      showAlert('No results found');
      return;
    }

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    displaySearchResults(results);
    document.querySelector('#search-term').value = '';
  } else {
    showAlert('Please enter a search term');
  }
}

async function displaySearchResults(results) {
  // Move to top of the page
  window.scrollTo(0, 0);

  // Clear previous results
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';

  results.forEach((result) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
    <a href="${global.search.type}-details.html?id=${result.id}">
    ${
      result.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w500${result.poster_path}" class="card-img-top" alt="${result.title}">`
        : `<img
        src="images/no-image.jpg"
        class="card-img-top"
        alt="${global.search.type === 'movie' ? result.title : result.name}"
      />`
    }
  </a>
  <div class="card-body">
    <h5 class="card-title">${
      global.search.type === 'movie' ? result.title : result.name
    }</h5>
    <p class="card-text">
      <small class="text-muted">Release: ${
        global.search.type === 'movie'
          ? result.release_date
          : result.first_air_day
      }</small>
    </p>
  </div>
  `;

    document.querySelector('#search-results-heading').innerHTML = `<h2>${
      results.length * global.search.page
    } of ${global.search.totalResults} for ${global.search.term}</h2>`;

    document.querySelector('#search-results').append(div);
  });

  displayPagination();
}

// Create and dispalay pagination
function displayPagination() {
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `
  <button class="btn btn-primary" id="prev">Prev</button>
  <button class="btn btn-primary" id="next">Next</button>
  <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`;

  document.querySelector('#pagination').appendChild(div);

  // Disable prev button if on first page
  if (global.search.page === 1) {
    document.querySelector('#prev').disabled = true;
  }

  // Disable next button if on last page
  if (global.search.page === global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }

  // Next page
  document.querySelector('#next').addEventListener('click', async () => {
    global.search.page++;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });

  // Prev page
  document.querySelector('#prev').addEventListener('click', async () => {
    global.search.page--;
    const { results, total_pages } = await searchAPIData();
    displaySearchResults(results);
  });
}

// Show alert
function showAlert(message, className = 'error') {
  const div = document.createElement('div');
  div.classList.add('alert', className);
  div.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

// 20 Popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular');
  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
    <a href="movie-details.html?id=${movie.id}">
    ${
      movie.poster_path
        ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">`
        : `<img
        src="images/no-image.jpg"
        class="card-img-top"
        alt="${movie.title}"
      />`
    }
  </a>
  <div class="card-body">
    <h5 class="card-title">${movie.title}</h5>
    <p class="card-text">
      <small class="text-muted">Release: ${movie.release_date}</small>
    </p>
  </div>
  `;

    document.querySelector('#popular-movies').append(div);
  });
}

// 20 Popular TV shows
async function displayPopularShows() {
  const { results } = await fetchAPIData('tv/popular');
  results.forEach((show) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
      <a href="tv-details.html?id=${show.id}">
      ${
        show.poster_path
          ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="${show.name}">`
          : `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="${show.name}"
        />`
      }
    </a>
    <div class="card-body">
      <h5 class="card-title">${show.name}</h5>
      <p class="card-text">
        <small class="text-muted">Air Date: ${show.first_air_day}</small>
      </p>
    </div>
    `;

    document.querySelector('#popular-shows').append(div);
  });
}

// Display Movie Details
async function displayMovieDetails() {
  const movieId = new URLSearchParams(window.location.search).get('id');
  const movie = await fetchAPIData(`movie/${movieId}`);

  // Overlay for background image
  displayBackgroundOverlay('movie', movie.backdrop_path);

  const div = document.createElement('div');
  div.innerHTML = `<div class="details-top">
    <div>
      ${
        movie.poster_path
          ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">`
          : `<img
        src="images/no-image.jpg"
        class="card-img-top"
        alt="${movie.title}"
      />`
      }
    </div>
    <div>
      <h2>${movie.title}</h2>
      <p>
        <i class="fas fa-star text-primary"></i>
        ${movie.vote_average.toFixed(1)} / 10
      </p>
      <p class="text-muted">Release Date: ${movie.release_date}</p>
      <p>
        ${movie.overview}
      </p>
      <h5>Genres</h5>
      <ul class="list-group">
        ${movie.genres
          .map((genre) => `<li class="list-group-item">${genre.name}</li>`)
          .join('')}
      </ul>
      <a href="${movie.homepage}
      }" target="_blank" class="btn">Visit Movie Homepage</a>
    </div>
  </div>
  
  <div class="details-bottom">
  <h2>Movie Info</h2>
  <ul>
    
    <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(
      movie.budget
    )}</li>
    <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(
      movie.revenue
    )}</li>
    <li><span class="text-secondary">Runtime:</span> ${movie.runtime}</li>
    <li><span class="text-secondary">Status:</span> ${movie.status}</li>
  </ul>
  <h4>Production Companies</h4>
  <div class="list-group">${movie.production_companies
    .map((company) => `<span>${company.name}</span>`)
    .join(', ')}</div>
</div>`;

  document.querySelector('#movie-details').append(div);
}

// Display TV-shows Details
async function displayShowDetails() {
  const showId = new URLSearchParams(window.location.search).get('id');
  const show = await fetchAPIData(`tv/${showId}`);

  // Overlay for background image
  displayBackgroundOverlay('tv', show.backdrop_path);

  const div = document.createElement('div');
  div.innerHTML = `<div class="details-top">
      <div>
        ${
          show.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="${show.name}">`
            : `<img
          src="images/no-image.jpg"
          class="card-img-top"
          alt="${show.name}"
        />`
        }
      </div>
      <div>
        <h2>${show.name}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${show.vote_average.toFixed(1)} / 10
        </p>
        <p class="text-muted">Release Date: ${show.first_air_day}</p>
        <p>
          ${show.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
          ${show.genres
            .map((genre) => `<li class="list-group-item">${genre.name}</li>`)
            .join('')}
        </ul>
        <a href="${show.homepage}
        }" target="_blank" class="btn">Visit Movie Homepage</a>
      </div>
    </div>
    
    <div class="details-bottom">
    <h2>Show Info</h2>
    <ul>
      
      <li><span class="text-secondary">Number Of Episodes:</span> ${
        show.number_of_episodes
      }</li>
      <li><span class="text-secondary">Last Episode To Air:</span> ${
        show.last_episode_to_air.name
      }</li>
      <li><span class="text-secondary">Status:</span> ${show.status}</li>
    </ul>
    <h4>Production Companies</h4>
    <div class="list-group">${show.production_companies
      .map((company) => `<span>${company.name}</span>`)
      .join(', ')}</div>
  </div>`;

  document.querySelector('#show-details').append(div);
}

// Display Background Overlay
function displayBackgroundOverlay(type, backdropPath) {
  const div = document.createElement('div');
  div.classList.add('overlay');
  div.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backdropPath})`;

  if (type === 'movie') {
    document.querySelector('#movie-details').append(div);
  } else {
    document.querySelector('#show-details').append(div);
  }
}

// Display Similar Movies
async function displaySlider(movies) {
  const { results } = await fetchAPIData(`movie/now_playing`);

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
    <a href="movie-details.html?id=${movie.id}">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
    </a>
    <h4 class="swiper-rating">
      <i class="fas fa-star text-secondary"></i> ${movie.vote_average} / 10
    </h4>`;

    document.querySelector('.swiper-wrapper').appendChild(div);
    initSwiper();
  });
}

function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    freeMode: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      900: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 5,
      },
    },
  });
}

// Fetch data from TMDB API
async function fetchAPIData(endpoint) {
  showSpinner();

  const response = await fetch(
    `${global.api.apiURL}${endpoint}?api_key=${global.api.apiKey}&language=en-US`
  );

  const data = await response.json();

  hideSpinner();
  return data;
}

async function searchAPIData() {
  showSpinner();

  const response = await fetch(
    `${global.api.apiURL}search/${global.search.type}?api_key=${global.api.apiKey}&language=en-US&query=${global.search.term}&page=${global.search.page}`
  );

  const data = await response.json();

  hideSpinner();
  return data;
}

function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', init);

function addCommasToNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
