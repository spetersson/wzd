import Game from "./game";

const W = 1800;
const H = 1200;

function getElems() {
    const joinForm = document.getElementById("join-form") as HTMLFormElement;
    const hostField = document.getElementById("host-field") as HTMLInputElement;
    const nameField = document.getElementById("name-field") as HTMLInputElement;
    const joinContainer = document.getElementById(
        "join-container"
    ) as HTMLDivElement;
    const gameContainer = document.getElementById(
        "game-container"
    ) as HTMLDivElement;
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    return {
        joinForm,
        hostField,
        nameField,
        joinContainer,
        gameContainer,
        canvas,
    };
}

window.onload = () => {
    const { joinForm, hostField, nameField } = getElems();
    joinForm.onsubmit = (evt: SubmitEvent) => {
        evt.preventDefault();
        startGame(hostField.value, nameField.value);
    };
};

async function startGame(host: string, nick: string) {
    const { joinContainer, gameContainer, canvas } = getElems();

    const game = new Game();
    await game.join(host, nick);

    joinContainer.style.display = "none";
    gameContainer.style.display = "block";

    canvas.width = W;
    canvas.height = H;
    const gc = canvas.getContext("2d");

    let lastTime = Date.now();
    const loop = async () => {
        const now = Date.now();
        await game.update((now - lastTime) / 1000);
        await game.draw(gc, W, H);

        lastTime = now;
        requestAnimationFrame(loop);
    };
    loop();
}
