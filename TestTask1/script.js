

const yellowBlock = document.getElementById('YellowBlock');
const mainContainer = document.getElementById('MainContainer');
const yellowPlaceholder = document.getElementById("YellowPlaceholder");

function MoveYellowBlock() {
    if (window.innerWidth < 1000) {
        yellowPlaceholder.appendChild(yellowBlock);
    }
    else {
    mainContainer.appendChild(yellowBlock);
    }

}

MoveYellowBlock();

addEventListener("resize", MoveYellowBlock);