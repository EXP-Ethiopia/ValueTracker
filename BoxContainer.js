class BoxContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.selectedBoxes = []; 
        this.tags = [];  // Store the tags dynamically
        this.comboBox = document.createElement('select');
        this.comboBox.id = 'tagSelect';
    }

    // loadSelectedBoxes() {
    //     const savedBoxes = localStorage.getItem('selectedBoxes');
    //     return savedBoxes ? JSON.parse(savedBoxes) : [];
    // }

    // saveSelectedBoxes() {
    //     localStorage.setItem('selectedBoxes', JSON.stringify(this.selectedBoxes));
    // }

    generateBoxes(num) {
        for (let i = 1; i <= num; i++) {
            const box = new Box(i, this);
            this.boxes.push(box);
            this.container.appendChild(box.element);

            if (this.selectedBoxes.includes(i)) {
                box.selectBox();
            }
        }
    }

    getTimeSlot(id) {
        const startHour = 5 + Math.floor(id / 2);
        const startMinute = (id % 2 === 1) ? 30 : 0;
        
        let endHour = startHour;
        let endMinute = startMinute === 0 ? 30 : 0;
        if (startMinute === 30) endHour++;
        
        const startAMPM = startHour >= 12 ? 'PM' : 'AM';
        const endAMPM = endHour >= 12 ? 'PM' : 'AM';
        
        const formattedStartHour = startHour % 12 || 12;
        const formattedEndHour = endHour % 12 || 12;
        
        const startTime = `${formattedStartHour}:${startMinute === 0 ? '00' : '30'} ${startAMPM}`;
        const endTime = `${formattedEndHour}:${endMinute === 0 ? '00' : '30'} ${endAMPM}`;
        
        return `${startTime} - ${endTime}`;
    }

    populateComboBox() {
        this.comboBox.innerHTML = '';  // Clear previous options to prevent duplicates
        this.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.tagName;
            option.textContent = tag.tagName;
            option.style.color = tag.color;
            this.comboBox.appendChild(option);
        });
    }

    showCustomPopup() {
       

        // 🔄 Refill selectedBoxes with only the currently selected boxes
        this.selectedBoxes = this.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);
    
        if (this.selectedBoxes.length === 0) {
            Swal.fire({
                title: "No Boxes Selected",
                text: "Please select at least one box before proceeding.",
                icon: "warning",
                confirmButtonText: "OK",
                showClass: { popup: "animate__animated animate__shakeX animate__faster" }
            });
            return;
        }
    
        // 🎯 Generate correct time slots message
        let selectedBoxesMessage = this.selectedBoxes.map(id => this.getTimeSlot(id)).join(', ');
    
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
    
        const modal = document.createElement('div');
        modal.classList.add('modal');
    
        const title = document.createElement('h2');
        title.textContent = `Selected Boxes: ${selectedBoxesMessage}`;
    
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter Task here...';
    
        this.populateComboBox();
    
        const submitButton = document.createElement('button');
        submitButton.classList.add('submitBTN');
        submitButton.textContent = 'Submit';
        submitButton.addEventListener('click', () => {
            const inputData = inputField.value;
            const selectedOption = this.comboBox.value;
        
            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
            if (selectedTag) {
                this.selectedBoxes.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = selectedTag.color;
                    }
                });
            }
        
            alert(`Input: ${inputData}, Selected Option: ${selectedOption}`);
        
            // 🛑 Clear selectedBoxes array
            this.selectedBoxes = [];
        
            // ❌ Remove 'selected' class from boxes so UI updates
            this.boxes.forEach(box => {
                box.element.classList.remove('selected');
            });
        
            console.log("Cleared Selected Boxes:", this.selectedBoxes);
        
            document.body.removeChild(overlay);
        });
    
        const closeButton = document.createElement('button');
        closeButton.classList.add('submitBTN');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    
        modal.append(title, inputField, this.comboBox, submitButton, closeButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
    
    

    addTag(tagName, color) {
        if (!this.tags.some(tag => tag.tagName === tagName)) {
            this.tags.push(new Tag(tagName, color));
            this.populateComboBox();  // Refresh dropdown
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const submitBTN = document.getElementById('saveBoxes');
    // const boxContainer = new BoxContainer('boxContainer');

    const initializeTags = () => {
        const tags = [
            { name: "Work", color: "#FF0000" },
            { name: "Personal Dev", color: "brown" },
            { name: "School", color: "green" },
            { name: "FuncTime", color: "Blue" },
            { name: "Team Time", color: "purple" }
        ];
        tags.forEach(tag => boxContainer.addTag(tag.name, tag.color));
    };
    initializeTags();

    if (submitBTN) {
        submitBTN.addEventListener('click', () => boxContainer.showCustomPopup());
    } else {
        console.error('Button with ID "saveBoxes" not found!');
    }
});