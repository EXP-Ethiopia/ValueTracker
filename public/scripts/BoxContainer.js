export class BoxContainer {
    constructor(containerId, auth, db) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.selectedBoxes = []; 
        this.tags = [];  // Store the tags dynamically
        this.comboBox = document.createElement('select');
        this.comboBox.id = 'tagSelect';

        this.auth = auth; 
        this.db = db;     
    }

    calculateTotalTime() {
        let totalTime = 0;
    
        // Loop through all the boxes and add the TimeValue of selected boxes
        this.boxes.forEach(box => {
            if (box.element.classList.contains('selected')) {
                totalTime += box.TimeValue; 
            }
        });
    
        console.log(`Total Time for Selected Boxes: ${totalTime} hours`); 
        return totalTime;  
    }

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
        this.comboBox.innerHTML = ''; 
        this.tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.tagName;
            option.textContent = tag.tagName;
            option.style.color = tag.color;
            this.comboBox.appendChild(option);
        });
    }

    showCustomPopup() {
        // Refill selectedBoxes with only the currently selected boxes
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
        submitButton.addEventListener('click', async () => {
            const inputData = inputField.value;
            const selectedOption = this.comboBox.value;
    
            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
            let selectedTagColor = selectedTag ? selectedTag.color : "#000"; // Default color if none selected
    
            if (selectedTag) {
                this.selectedBoxes.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = selectedTag.color;
                        box.element.style.color = "#fff";
                    }
                });
            }

        

        const taskRef = ref(this.db, 'userTasks/' + userId + '/' + new Date().getTime()); // Using timestamp as a unique ID

        set(taskRef, {
            task: inputData,  
            selectedBoxes: this.selectedBoxes, 
            totalTime: this.calculateTotalTime(), 
            tag: selectedOption,  
            color: selectedTagColor,  
            timestamp: new Date().toISOString()  // Timestamp of the task creation
        })
        .then(() => {
            console.log("Data saved to Realtime Database successfully");
            Swal.fire({
                title: "Saved!",
                text: "Your task has been saved successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });
        })
        .catch(error => {
            console.error("Error saving to Realtime Database:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to save data. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        });
                    this.selectedBoxes = [];
            
                    // Remove 'selected' class from boxes so UI updates
                    this.boxes.forEach(box => {
                        box.element.classList.remove('selected');
                    });
            
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
            this.populateComboBox();  
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const submitBTN = document.getElementById('saveBoxes');

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