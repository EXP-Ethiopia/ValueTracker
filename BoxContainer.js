
class BoxContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.selectedBoxes = this.loadSelectedBoxes();  
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
        const startHour = 5 + Math.floor((id - 1) / 2);  // Start hour
        const startMinute = (id % 2 === 1) ? 30 : 0;    // 30-minute intervals
        const endHour = startHour + (startMinute === 30 ? 1 : 0);  // End hour
        const endMinute = (startMinute === 0) ? 30 : 0;

        const startAMPM = startHour >= 12 ? 'PM' : 'AM';
        const endAMPM = endHour >= 12 ? 'PM' : 'AM';

        const formattedStartHour = startHour % 12 === 0 ? 12 : startHour % 12;
        const formattedEndHour = endHour % 12 === 0 ? 12 : endHour % 12;

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

        const comboBox = document.createElement('select');
        comboBox.id = 'tagSelect';
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

const submitBTN = document.getElementById('saveBoxes');
submitBTN.addEventListener('click', () => {
    boxContainer.showCustomPopup();
});