class Box {
    constructor(id, boxContainer) {
        this.id = id;
        this.boxContainer = boxContainer;
        this.element = this.createBox();
        this.TimeValue = 0.5;
    }

    createBox() {
        const div = document.createElement('div');
        div.classList.add('box');
        div.textContent = this.getTimeSlot();
        div.addEventListener('click', this.handleClick.bind(this));
        return div;
    }
    
    generateBoxes() {
        // Clear existing boxes
        this.container.innerHTML = '';
        this.boxes = [];
        
        // Generate 48 boxes (24 hours in 30-minute intervals)
        for (let i = 1; i <= 48; i++) {
            const box = new Box(i, this);
            this.boxes.push(box);
            this.container.appendChild(box.element);
        }
    }

    handleClick() {
        this.selectBox();
        this.boxContainer.toggleInArray();
    }

    selectBox() {
        this.element.classList.toggle('selected');
    }

    getTimeSlot() {
        const startTime = this.calculateTime(this.id);
        const endTime = this.calculateTime(this.id + 1);
        return `${startTime} - ${endTime}`;
    }

    calculateTime(slotIndex) {
        const baseHour = 5;
        const baseMinute = 30;    
        let totalMinutes = baseHour * 60 + baseMinute + (slotIndex - 1) * 30;
        let hours24 = Math.floor(totalMinutes / 60) % 24; 
        let minutes = totalMinutes % 60;
        let period = hours24 >= 12 ? "PM" : "AM";
        let hours12 = hours24 % 12 || 12;
        let formattedMinutes = minutes.toString().padStart(2, "0");
        return `${hours12}:${formattedMinutes} ${period}`;
    }
}