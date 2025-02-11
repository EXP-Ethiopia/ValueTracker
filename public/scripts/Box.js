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
    
            let startTime = this.calculateTime(this.id);
            let endTime = this.calculateTime(this.id + 1);
    
            div.textContent = `${startTime} - ${endTime}`;  // Set time slot
            div.addEventListener('click', this.handleClick.bind(this));
    
            return div;
        }

        
        handleClick() {
        this.selectBox();
        this.toggleInArray();
        }

        selectBox() {
            this.element.classList.toggle('selected');
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