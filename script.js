const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

const API = "http://localhost:3000";

// Carrega tarefas do backend ao abrir a página
async function showTask() {
  const res = await fetch(`${API}/tasks`);
  const tasks = await res.json();
  listContainer.innerHTML = "";
  tasks.forEach(renderTask);
}

function renderTask(task) {
  let li = document.createElement("li");
  li.dataset.id = task.id;
  li.innerHTML = task.text;
  if (task.checked) li.classList.add("checked");
  let span = document.createElement("span");
  span.innerHTML = "\u00d7";
  li.appendChild(span);
  listContainer.appendChild(li);
}

async function addTask() {
  if (inputBox.value === "") {
    alert("You must write something");
    return;
  }
  const res = await fetch(`${API}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputBox.value }),
  });
  const task = await res.json();
  renderTask(task);
  inputBox.value = "";
}

listContainer.addEventListener("click", async function (e) {
  if (e.target.tagName === "LI") {
    const li = e.target;
    const checked = !li.classList.contains("checked");
    li.classList.toggle("checked");
    await fetch(`${API}/tasks/${li.dataset.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked }),
    });
  } else if (e.target.tagName === "SPAN") {
    const li = e.target.parentElement;
    await fetch(`${API}/tasks/${li.dataset.id}`, { method: "DELETE" });
    li.remove();
  }
});

inputBox.addEventListener("keypress", function (event) {
  if (event.key === "Enter") addTask();
});

showTask();
