const global = {
  currentPage: window.location.pathname,
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

  console.log(movie);

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
  console.log(API_KEY);
  const API_URL = 'https://api.themoviedb.org/3/';

  showSpinner();

  const response = await fetch(
    `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
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
