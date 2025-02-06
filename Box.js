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
            const baseHour = 5;
            const baseMinute = 30;    
            
            // Calculate the total minutes from the base time (5:30 AM) based on the slot index
            let totalMinutes = baseHour * 60 + baseMinute + (slotIndex - 1) * 30;
            
            // Calculate the hour in 24-hour format, wrapping around to 24-hour cycle if needed
            let hours24 = Math.floor(totalMinutes / 60) % 24; 
            // Get the minutes part
            let minutes = totalMinutes % 60;
            
            // Determine AM or PM based on the 24-hour format hour
            let period = hours24 >= 12 ? "PM" : "AM";
            
            // Convert to 12-hour format. If hours24 % 12 results in 0 (for midnight or noon), show 12.
            let hours12 = hours24 % 12 || 12;
        
            // Format minutes with leading zero if needed
            let formattedMinutes = minutes.toString().padStart(2, "0");
        
            // Return the time in the format: "hh:mm AM/PM"
            return `${hours12}:${formattedMinutes} ${period}`;
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
    
