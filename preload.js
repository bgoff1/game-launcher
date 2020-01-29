// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const Store = require("electron-store");
  const ipc = require("electron").ipcRenderer;
  const store = new Store();
  let games = store.get("games", []);
  let gamesChecked = games.map(game => ({
    game,
    checked: false
  }));
  let game;
  document.getElementById("remove-checked").classList.toggle("hide");

  updateDOM();

  document.getElementById("submit-game").addEventListener("click", addGame);

  document
    .getElementById("select-file")
    .addEventListener("click", () => ipc.send("open-file-dialog"));

  document
    .getElementById("remove-checked")
    .addEventListener("click", removeChecked);

  ipc.on("selected-file", (event, path) => {
    if (!path.cancelled) {
      document.getElementById("selected-file").innerText = JSON.stringify(
        path.filePaths[0]
      );
      game.path = path.filePaths[0];
    }
  });

  function addGame() {
    document.getElementById("remove-checked").classList.toggle("hide");
    game.name = document.getElementById("game-name").value;
    if (game.name.trim() && game.path.trim()) {
      store.set("games", [...store.get("games", []), game]);

      document.getElementById("selected-file").innerText = "";
      document.getElementById("game-name").value = "";
      updateDOM();
    }
  }

  function removeChecked() {
    store.set(
      "games",
      store.get("games", []).filter(game =>
        gamesChecked
          .filter(g => !g.checked)
          .map(g => JSON.stringify(g.game))
          .includes(JSON.stringify(game))
      )
    );
    if (store.get("games", []).length === 0) {
      document.getElementById("remove-checked").classList.toggle("hide");
    }
    updateDOM();
  }
  function updateDOM() {
    games = store.get("games", []);
    gamesChecked = games.map(game => ({
      game,
      checked: false
    }));

    const gameList = document.getElementById("game-list");
    let gameListInnerHTML = "";
    for (const game of games) {
      gameListInnerHTML += `<div>
      <input type="checkbox"
        id="${game.name}-${games.indexOf(game)}-checkbox">
      <button id="${game.name}-${games.indexOf(game)}" title="${game.path}">
        ${game.name}
      </button>
    </div>`;
    }
    gameList.innerHTML = gameListInnerHTML;
    game = {
      name: "",
      path: ""
    };

    for (const game of games) {
      document
        .getElementById(`${game.name}-${games.indexOf(game)}`)
        .addEventListener("click", () => {
          ipc.send("start-game", game.path);
        });
      document
        .getElementById(`${game.name}-${games.indexOf(game)}-checkbox`)
        .addEventListener("change", function() {
          gamesChecked.find(
            g => g.game.name === game.name
          ).checked = this.checked;
        });
    }
  }
});
