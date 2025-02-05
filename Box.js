    class Box {
        constructor(id) {
        this.id = id;
        this.boxContainer = boxContainer;
        this.element = this.createBox();
        }
    
        createBox() {
        const div = document.createElement('div');
        div.classList.add('box');
        div.textContent = `Box ${this.id}`;
        div.addEventListener('click', this.handleClick.bind(this));
        return div;
        }
    
        handleClick() {

        this.selectBox();
        this.toggleInArray();
        // this.showCustomPopup(`Box ${this.id}`);
        }

        selectBox() {
            // Toggle the "selected" class for the clicked box
            this.element.classList.toggle('selected');
        }

        toggleInArray() {
            const index = this.boxContainer.selectedBoxes.indexOf(this.id);
        
            // If the box is selected, add it to the array
            if (this.element.classList.contains('selected')) {
                if (index === -1) {  // Only add if it's not already in the array
                    this.boxContainer.selectedBoxes.push(this.id);
                }
            } else {
                // If the box is unselected, remove it from the array
                if (index !== -1) {  // Only remove if it's already in the array
                    this.boxContainer.selectedBoxes.splice(index, 1);
                }
            }
        
            // Log the array to the console
            console.log('Selected Boxes:', this.boxContainer.selectedBoxes);
        }
        
        
    
        showCustomPopup(message) {
        
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        
        const modal = document.createElement('div');
        modal.classList.add('modal');
        
        const title = document.createElement('h2');
        title.textContent = `Form for ${message}`;
        
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter Task here...';
        
        const comboBox = document.createElement('select');
        const option1 = document.createElement('option');
        option1.value = 'option1';
        option1.textContent = 'Work';
        const option2 = document.createElement('option');
        option2.value = 'option2';
        option2.textContent = 'Personal';
        comboBox.appendChild(option1);
        comboBox.appendChild(option2);
        
        const submitButton = document.createElement('button');
        submitButton.classList.add('submitBTN');
        submitButton.textContent = 'Submit';
    
        submitButton.addEventListener('click', () => {
            const inputData = inputField.value;  
            const selectedOption = comboBox.value; 
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
    }
    