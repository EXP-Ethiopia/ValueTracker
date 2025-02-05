 class BoxContainer {


    constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.boxes = [];
    this.selectedBoxes = [];
    }

    generateBoxes(num) {
        for (let i = 1; i <= num; i++) {
        const box = new Box(i,this);
        this.boxes.push(box);
        this.container.appendChild(box.element);
        }
    }
}
