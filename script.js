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
  
  // Функция рендера списка
  const renderAutocomplete = (items) => {
    autocompleteList.innerHTML = ''; // Очистка предыдущих результатов
  
    if (!items.length || !searchInput.value.trim()) {
      autocompleteList.style.display = 'none';
      return;
    }
  
    autocompleteList.style.display = 'block';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('autocomplete-item');
      li.textContent = item.name;
      li.addEventListener('click', () => {
        addRepoToList(item);
        autocompleteList.style.display = 'none';
        searchInput.value = '';
      });
      autocompleteList.appendChild(li);
    });
  };
  
  // Функция добавления репозитория в список 
  const addRepoToList = (repo) => {
    // Проверка на дублирование
    if ([...repoList.children].some(item => item.dataset.id === repo.id.toString())) {
      return;
    }
  
    const li = document.createElement('li');
    li.classList.add('repo-item');
    li.dataset.id = repo.id;
    li.innerHTML = `
      <div>
        <strong>${repo.name}</strong> <br>
        Owner: ${repo.owner.login} <br>
        Stars: ${repo.stargazers_count}
      </div>
    `;
  
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('remove-btn');
    removeBtn.addEventListener('click', () => li.remove());
  
    li.appendChild(removeBtn);
    repoList.appendChild(li);
  };
  
  // Дебаунс-обработчик ввода 
  const debouncedSearch = debounce(async () => {
    const query = searchInput.value.trim();
    if (!query) {
      autocompleteList.style.display = 'none';
      return;
    }
    const items = await fetchRepos(query);
    renderAutocomplete(items);
  }, 400);
  
  searchInput.addEventListener('input', debouncedSearch);
  