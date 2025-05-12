    class Box {

    constructor(id,boxContainer) {
        this.id = id;
        this.boxContainer = boxContainer;
        this.element = this.createBox();
        this.TimeValue = 0.5; //767
    }

    createBox() {
        const div = document.createElement('div');
        div.classList.add('box');
        
        const startTime = this.calculateTime(this.id);
        const endTime = this.calculateTime(this.id + 1);
        
        div.textContent = `${startTime} - ${endTime}`;  // Set time slot
        div.addEventListener('click', this.handleClick.bind(this));
        
        return div;
    }

    handleClick() {
        // Toggle selection
        if (this.element.classList.contains('selected')) {
            this.deselectBox();
        } else {
            this.selectBox();
        }
        this.toggleInArray();
    }

    selectBox() {
        this.element.classList.add('selected');
        this.updateModalDisplay();
    }

    deselectBox() {
        this.element.classList.remove('selected');
        this.updateModalDisplay();
    }

    updateModalDisplay() {
        const selectedBoxes = this.boxContainer.selectedBoxes;
        const modal = document.querySelector('.modal');
        if (!modal) return;

        // Clear existing display
        const timeDisplay = modal.querySelector('.time-display');
        if (timeDisplay) timeDisplay.remove();

        // Create new display
        const displayDiv = document.createElement('div');
        displayDiv.className = 'time-display';

        if (selectedBoxes.length === 0) {
            displayDiv.textContent = 'No boxes selected';
        } else if (selectedBoxes.length === 1) {
            const box = this.boxContainer.boxes.find(b => b.id === selectedBoxes[0]);
            displayDiv.textContent = box.element.textContent;
        } else {
            const firstBox = this.boxContainer.boxes.find(b => b.id === selectedBoxes[0]);
            const lastBox = this.boxContainer.boxes.find(b => b.id === selectedBoxes[selectedBoxes.length - 1]);
            
            const startTime = firstBox.element.textContent.split(' - ')[0];
            const endTime = lastBox.element.textContent.split(' - ')[1];
            
            displayDiv.innerHTML = `
                <div class="time-range">
                    <span class="start-time">${startTime}</span>
                    <span class="to">to</span>
                    <span class="end-time">${endTime}</span>
                </div>
                <div class="total-boxes">
                    <span class="count">${selectedBoxes.length}</span>
                    <span class="label">boxes selected</span>
                </div>
            `;
        }

        modal.insertBefore(displayDiv, modal.firstChild);
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

    toggleInArray() {
        this.boxContainer.selectedBoxes = this.boxContainer.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);

        this.boxContainer.calculateTotalTime();
        console.log(this.boxContainer.selectedBoxes);
    }
}