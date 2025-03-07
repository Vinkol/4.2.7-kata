// Дебаунс-функция для оптимизации запросов
const debounce = (fn, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

// DOM-элементы
const searchInput = document.querySelector('.searchInput');
const autocompleteList = document.querySelector('.autocompleteList');
const repoList = document.querySelector('.repoList');

// Функция запроса к GitHub API
const fetchRepos = async (query) => {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка сети или лимит GitHub API!');
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Функция рендера списка автодополнения
const renderAutocomplete = (items) => {
  // теперь используется textContent
  autocompleteList.textContent = ''; // Очищаем список

  if (!items.length || !searchInput.value.trim()) {
    autocompleteList.classList.add('hidden');
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add('autocomplete-item');
    li.textContent = item.name;
    li.dataset.repoId = item.id;

    fragment.appendChild(li);
  });

  autocompleteList.appendChild(fragment);
  autocompleteList.classList.remove('hidden');
};

// Функция добавления репозитория в список
const addRepoToList = (repo) => {
  // Проверка на дубликаты
  if ([...repoList.children].some(item => item.dataset.id === repo.id.toString())) {
    return;
  }

// Теперь используется document.createElement
  const li = document.createElement('li');
  li.classList.add('repo-item');
  li.dataset.id = repo.id;

  const infoDiv = document.createElement('div');

  const name = document.createElement('strong');
  name.textContent = repo.name;

  const owner = document.createElement('p');
  owner.textContent = `Owner: ${repo.owner.login}`;

  const stars = document.createElement('p');
  stars.textContent = `Stars: ${repo.stargazers_count}`;

  infoDiv.append(name, owner, stars);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.classList.add('remove-btn');
  removeBtn.addEventListener('click', () => li.remove());

  li.append(infoDiv, removeBtn);
  repoList.appendChild(li);
};

// Дебаунс-обработчик ввода
const debouncedSearch = debounce(async (event) => {
  const query = event.target.value.trim();
  if (!query) {
    autocompleteList.classList.add('hidden');
    return;
  }
  // Добавил обработку ошибок
  try {
    const items = await fetchRepos(query);
    renderAutocomplete(items);
  } catch (error) {
    console.error('Ошибка при поиске репозиториев:', error);
  }
}, 400);

// Обработчик ввода в поле поиска
searchInput.addEventListener('input', debouncedSearch);

// Обработчик кликов по списку автодополнения
autocompleteList.addEventListener('click', (event) => {
  if (event.target.classList.contains('autocomplete-item')) {
    const repoId = event.target.dataset.repoId;
    fetchRepos(searchInput.value).then((items) => {
      const selectedRepo = items.find(repo => repo.id.toString() === repoId);
      if (selectedRepo) {
        addRepoToList(selectedRepo);
        autocompleteList.classList.add('hidden');
        searchInput.value = '';
      }
    });
  }
});
