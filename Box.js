    class Box {
        constructor(id) {
        this.id = id;
        this.boxContainer = boxContainer;
        this.element = this.createBox();
        this.TimeValue = 0.5; //767
        }
    
        createBox() {
            const div = document.createElement('div');
            div.classList.add('box');
    
            // Calculate the time slot
            let startTime = this.calculateTime(this.id);
            let endTime = this.calculateTime(this.id + 1);
    
            div.textContent = `${startTime} - ${endTime}`;  // Set time slot
            div.addEventListener('click', this.handleClick.bind(this));
    
            return div;
        }

        
        handleClick() {

        // this.showCustomPopup(`Box ${this.id}`);
        this.selectBox();
        this.toggleInArray();
        }

        selectBox() {
            
            this.element.classList.toggle('selected');
        }

        calculateTime(slotIndex) {
            let baseHour = 5; 
            let baseMinute = 30;
            let totalMinutes = baseHour * 60 + baseMinute + (slotIndex - 1) * 30;
    
            let hours24 = Math.floor(totalMinutes / 60) % 24; // Keep within 24-hour format
            let minutes = totalMinutes % 60; 
            let period = hours24 >= 12 ? "PM" : "AM";
    
            let hours12 = hours24 % 12 || 12; // Convert to 12-hour format (ensure 12 instead of 0)
    
    
            return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
        }
    

        toggleInArray() {
            const index = this.boxContainer.selectedBoxes.indexOf(this.id);
        
        
            if (this.element.classList.contains('selected')) {
                if (index === -1) {  
                    this.boxContainer.selectedBoxes.push(this.id);
                }
            } else {
            
                if (index !== -1) {  
                    this.boxContainer.selectedBoxes.splice(index, 1);
                }
            }
            
        
            this.boxContainer.saveSelectedBoxes();
            console.log('Selected Boxes:', this.boxContainer.selectedBoxes);
        }


    }
    
