// ----- PEGANDO ELEMENTOS PRINCIPAIS DO HTML -----
const taskInput = document.getElementById("taskInput");       // campo onde o usuário digita a tarefa
const addTaskBtn = document.getElementById("addTaskBtn");     // botão para adicionar tarefa
const taskList = document.getElementById("taskList");         // lista onde as tarefas aparecem
const toggleTheme = document.getElementById("toggleTheme");   // botão que troca tema claro/escuro

// ----- FUNÇÃO PARA CARREGAR TAREFAS SALVAS DO LOCALSTORAGE -----
function loadTasks() {
  // Pega as tarefas salvas (se não houver, usa array vazio)
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Para cada tarefa salva, adiciona na tela usando addTask
  tasks.forEach(task => addTask(task.text, task.completed));
}

// ----- FUNÇÃO PARA SALVAR TAREFAS ATUAIS NO LOCALSTORAGE -----
function saveTasks() {
  const tasks = [];
  // Percorre todas as <li> da lista de tarefas
  taskList.querySelectorAll("li").forEach(li => {
    tasks.push({
      text: li.querySelector("span").textContent,        // pega o texto da tarefa
      completed: li.classList.contains("completed")      // verifica se está concluída
    });
  });

  // Salva o array de tarefas no localStorage em formato texto
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ----- FUNÇÃO QUE ADICIONA UMA TAREFA NA TELA -----
function addTask(text, completed = false) {
  if (!text) return; // não adiciona tarefa vazia

  const li = document.createElement("li");
  li.setAttribute("draggable", true);  // deixa a tarefa "arrastável"

  const span = document.createElement("span");
  span.textContent = text;
  li.appendChild(span);

  // Se a tarefa já estava concluída, adiciona a classe 'completed'
  if (completed) li.classList.add("completed");

  // Quando clicar no texto da tarefa, marca ou desmarca como concluída
  span.addEventListener("click", () => {
    li.classList.toggle("completed");
    saveTasks(); // salva a alteração
  });

  // Botão para apagar tarefa
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.addEventListener("click", () => {
    li.remove();    // remove a tarefa da lista
    saveTasks();    // salva a alteração
  });

  li.appendChild(deleteBtn);
  taskList.appendChild(li);

  addDragEvents(li); // ativa os eventos de drag and drop para essa tarefa
  saveTasks();       // salva a lista atualizada
}

// ----- EVENTOS PARA ADICIONAR TAREFA VIA BOTÃO OU ENTER -----
addTaskBtn.addEventListener("click", () => {
  addTask(taskInput.value); // adiciona a tarefa digitada
  taskInput.value = "";     // limpa o campo depois
});

taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") {  // se pressionar Enter
    addTask(taskInput.value);
    taskInput.value = "";
  }
});

// ----- FUNÇÃO PARA ADICIONAR OS EVENTOS DE DRAG AND DROP -----
function addDragEvents(item) {
  // Ao começar a arrastar
  item.addEventListener("dragstart", () => {
    item.classList.add("dragging"); // adiciona classe para estilizar o arrasto
  });

  // Ao soltar o item arrastado
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging"); // remove a classe
    saveTasks();                       // salva nova ordem das tarefas
  });
}

// ----- LÓGICA PARA CONTROLAR O DRAGOVER (arrastar sobre lista) -----
taskList.addEventListener("dragover", e => {
  e.preventDefault(); // necessário para permitir o drop

  // Pega o elemento logo após a posição atual do mouse
  const afterElement = getDragAfterElement(taskList, e.clientY);

  const dragging = document.querySelector(".dragging"); // item que está sendo arrastado
  if (!dragging) return;

  if (afterElement == null) {
    taskList.appendChild(dragging); // se não encontrou depois, coloca no final
  } else {
    taskList.insertBefore(dragging, afterElement); // insere na posição certa
  }
});

// ----- FUNÇÃO PARA SABER ONDE INSERIR O ITEM ARRASTADO -----
function getDragAfterElement(container, y) {
  // Pega todas as tarefas, exceto a que está sendo arrastada
  const elements = [...container.querySelectorAll("li:not(.dragging)")];

  // Reduz para encontrar o elemento mais próximo da posição y do mouse
  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();        // pega posição da tarefa
    const offset = y - box.top - box.height / 2;      // calcula distância do centro da tarefa

    // Retorna o elemento que está logo abaixo do mouse
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ----- FILTRO: mostrar todas, ativas ou concluídas -----
document.querySelectorAll("#filters button").forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove classe 'active' de todos os botões
    document.querySelectorAll("#filters button").forEach(b => b.classList.remove("active"));

    btn.classList.add("active"); // adiciona classe só no botão clicado

    const filter = btn.getAttribute("data-filter"); // pega filtro escolhido

    // Mostra/esconde tarefas conforme filtro
    document.querySelectorAll("li").forEach(li => {
      const isCompleted = li.classList.contains("completed");

      if (filter === "all") {
        li.style.display = "flex"; // mostra todas
      } else if (filter === "completed" && isCompleted) {
        li.style.display = "flex"; // mostra só as concluídas
      } else if (filter === "active" && !isCompleted) {
        li.style.display = "flex"; // mostra só as ativas
      } else {
        li.style.display = "none"; // esconde as outras
      }
    });
  });
});

// ----- BOTÃO PARA ALTERNAR TEMA CLARO/ESCURO -----
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("dark"); // adiciona/remove classe 'dark'

  // Salva preferência do tema no localStorage para lembrar depois
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);

  // Muda o texto do botão conforme o tema
  toggleTheme.textContent = theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Escuro";
});

// ----- CARREGA TEMA SALVO NO LOCALSTORAGE QUANDO ABRIR PÁGINA -----
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggleTheme.textContent = "☀️ Modo Claro";
}

// ----- CARREGA AS TAREFAS SALVAS QUANDO A PÁGINA ABRE -----
loadTasks();
