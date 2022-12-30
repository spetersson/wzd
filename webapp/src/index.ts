import Game from "./game";

function getElems() {
    const joinForm = document.getElementById("join-form") as HTMLFormElement;
    const nameField = document.getElementById("name-field") as HTMLInputElement;
    const joinContainer = document.getElementById(
        "join-container"
    ) as HTMLDivElement;
    const gameContainer = document.getElementById(
        "game-container"
    ) as HTMLDivElement;
    return { joinForm, nameField, joinContainer, gameContainer };
}

window.onload = () => {
    const { joinForm, nameField } = getElems();
    joinForm.onsubmit = (evt: SubmitEvent) => {
        evt.preventDefault();
        startGame(nameField.value);
    };
};

async function startGame(nick: string) {
    const { joinContainer, gameContainer } = getElems();

    const game = new Game();
    await game.join(nick);

    joinContainer.style.display = "none";
    gameContainer.style.display = "block";

    const loop = async () => {
        await game.update();
        await game.draw();
        requestAnimationFrame(loop);
    };
    loop();
}
