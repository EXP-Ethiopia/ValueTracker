

const comboBox = document.createElement('select');
comboBox.id = 'tagSelect';

// Method to populate comboBox with tags (only once)
function populateComboBox() {
    comboBox.innerHTML = '';  // Clear any previous options

    // Add tags dynamically to the comboBox
    boxContainer.tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag.tagName;
        option.textContent = tag.tagName;
        option.style.color = tag.color;
        comboBox.appendChild(option);
    });
}


class BoxContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.selectedBoxes = this.loadSelectedBoxes(); 
        this.tags = [];  // Store the tags dynamically 
    }

    loadSelectedBoxes() {
        const savedBoxes = localStorage.getItem('selectedBoxes');
        return savedBoxes ? JSON.parse(savedBoxes) : [];
    }

    saveSelectedBoxes() {
        localStorage.setItem('selectedBoxes', JSON.stringify(this.selectedBoxes));
    }

    generateBoxes(num) {
        for (let i = 1; i <= num; i++) {
            const box = new Box(i, this);
            this.boxes.push(box);
            this.container.appendChild(box.element);

            // If this box was previously selected, mark it as selected
            if (this.selectedBoxes.includes(i)) {
                box.selectBox();  // Mark it as selected based on saved state
            }
        }
    }

    getTimeSlot(id) {
        // Start hour calculation, ensuring it handles hours properly after midnight
        const startHour = 5 + Math.floor((id) / 2);  // Start hour (5:00 AM onwards)
        const startMinute = (id % 2 === 1) ? 30 : 0;     // 30-minute intervals (odd = 30 mins, even = 00 min)
    
        let endHour = startHour;
        let endMinute = (startMinute === 0) ? 30 : 0; // Add 30 minutes if start minute is 00
    
        if (startMinute === 30) {
            endHour = startHour + 1;
        }
    
        // Handle AM/PM correctly based on start hour and end hour
        const startAMPM = startHour >= 12 ? 'PM' : 'AM';
        const endAMPM = endHour >= 12 ? 'PM' : 'AM';
    
        // Adjust hours for proper AM/PM transition and handle 12-hour format
        const formattedStartHour = startHour % 12 === 0 ? 12 : startHour % 12;
        const formattedEndHour = endHour % 12 === 0 ? 12 : endHour % 12;
    
        // Ensure minutes are shown correctly (either 00 or 30)
        const startTime = `${formattedStartHour}:${startMinute === 0 ? '00' : '30'} ${startAMPM}`;
        const endTime = `${formattedEndHour}:${endMinute === 0 ? '00' : '30'} ${endAMPM}`;
    
        return `${startTime} - ${endTime}`;
    }
    
    
    
    
    showCustomPopup() {
        if (this.selectedBoxes.length === 0) {
            Swal.fire({
                title: "No Boxes Selected",
                text: "Please select at least one box before proceeding.",
                icon: "warning",
                confirmButtonText: "OK",
                showClass: {
                    popup: "animate__animated animate__shakeX animate__faster"
                }
            });
            return;
        }
    
        let selectedBoxesMessage = this.selectedBoxes
            .map(id => this.getTimeSlot(id))
            .join(', ');
    
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
    
        const modal = document.createElement('div');
        modal.classList.add('modal');

    
        const title = document.createElement('h2');
        title.textContent = `Selected Boxes: ${selectedBoxesMessage}`;
    
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter Task here...';

        populateComboBox();
    

    
        // Clear previous options in comboBox to avoid duplication
      
    
        // Add the tags dynamically from the tags array
        this.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.tagName;
            option.textContent = tag.tagName;
            option.style.color = tag.color;  // Use the color property from the Tag class
            comboBox.appendChild(option);
        });
    
        const submitButton = document.createElement('button');
        submitButton.classList.add('submitBTN');
        submitButton.textContent = 'Submit';
    
        submitButton.addEventListener('click', () => {
            const inputData = inputField.value;
            const selectedOption = comboBox.value;
    
            // Find the selected tag by name
            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
    
            if (selectedTag) {
                // Apply the color of the selected tag to each selected box
                this.selectedBoxes.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = selectedTag.color;
                    }
                });
            }
    
            alert(`Input: ${inputData}, Selected Option: ${selectedOption}`);
            document.body.removeChild(overlay);
        });
    
        const closeButton = document.createElement('button');
        closeButton.classList.add('submitBTN');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    
        modal.appendChild(title);
        modal.appendChild(inputField);
        modal.appendChild(comboBox);
        modal.appendChild(submitButton);
        modal.appendChild(closeButton);
    
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
    
    
    
    
    
    

    addTag(tagName, color) {
        this.tags.push(new Tag(tagName, color));

        const comboBox = document.getElementById('tagSelect');
        if (comboBox) {
            const option = document.createElement('option');
            option.value = tagName;
            option.textContent = tagName;
            option.style.color = color;
            comboBox.appendChild(option);
        }
    }



}

// Now bind the button click to show the popup
document.addEventListener('DOMContentLoaded', () => {
    const submitBTN = document.getElementById('saveBoxes');
    const comboBox = document.getElementById('tagSelect');
    
    if (submitBTN) {
        submitBTN.addEventListener('click', () => {
            // Add tags dynamically
              
            boxContainer.addTag("Work", "#FF0000");
            boxContainer.addTag("Personal Dev", "brown");
            boxContainer.addTag("School", "green");
            boxContainer.addTag("FuncTime", "Blue");
            boxContainer.addTag("Team Time", "purple");
            boxContainer.showCustomPopup();
            comboBox.innerHTML = '';   // Display the popup
        });
    } else {
        console.error('Button with ID "saveBoxes" not found!');
    }
});
