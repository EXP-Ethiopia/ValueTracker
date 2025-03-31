class BoxContainer {
    constructor(containerId, auth, db) {
        this.container = document.getElementById(containerId);
        this.boxes = [];
        this.selectedBoxes = [];
        this.tags = [];
        this.comboBox = document.createElement('select');
        this.comboBox.id = 'tagSelect';
        this.auth = auth;
        this.db = db;
        this.currentView = 'day';
        this.currentDate = new Date();
    }

    handleDayBoxSelection(boxId) {
        const box = this.boxes.find(b => b.id === boxId);
        if (box) {
            box.selectBox();
            this.toggleInArray();
        }
    }

    handleWeekBoxSelection(dayIndex, timeIndex) {
        // Calculate the actual box ID based on day and time
        const boxId = (dayIndex * 48) + parseInt(timeIndex) + 1;
        
        // Find the box in our boxes array
        const box = this.boxes.find(b => b.id === boxId);
        
        if (box) {
            box.selectBox();
            this.toggleInArray();
        }
    }

    handleMonthDaySelection(dayNumber) {
        const selectedDate = new Date(viewManager.currentDate);
        selectedDate.setDate(dayNumber);
        viewManager.currentDate = selectedDate;
        document.getElementById('viewSelector').value = 'day';
        viewManager.updateView();
    }

    handleYearDaySelection(monthIndex, dayNumber) {
        const selectedDate = new Date(viewManager.currentDate);
        selectedDate.setMonth(monthIndex);
        selectedDate.setDate(dayNumber);
        viewManager.currentDate = selectedDate;
        document.getElementById('viewSelector').value = 'day';
        viewManager.updateView();
    }


     // Update the toggleInArray method to work with all views
     toggleInArray() {
        this.selectedBoxes = this.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);
        
        this.calculateTotalTime();
        console.log("Selected boxes:", this.selectedBoxes);
    }

    // Update the showCustomPopup method to work with all views
    async showCustomPopup() {
        if (this.selectedBoxes.length === 0) {
            Swal.fire({
                title: "No Selection",
                text: "Please select at least one time slot before proceeding.",
                icon: "warning",
                confirmButtonText: "OK",
                showClass: { popup: "animate__animated animate__shakeX animate__faster" }
            });
            return;
        }

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        
        const modal = document.createElement('div');
        modal.classList.add('modal');
        
        const title = document.createElement('h2');
        title.textContent = `Selected Time Slots`;
        
        const timeSlotsList = document.createElement('div');
        timeSlotsList.className = 'time-slots-list';
        
        this.selectedBoxes.forEach(boxId => {
            const box = this.boxes.find(b => b.id === boxId);
            if (box) {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot-item';
                timeSlot.textContent = box.getTimeSlot();
                timeSlotsList.appendChild(timeSlot);
            }
        });

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter task description...';
        inputField.className = 'task-input';

        this.populateComboBox();

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'modal-button-container';

        const submitButton = document.createElement('button');
        submitButton.className = 'modal-button save';
        submitButton.textContent = 'Save';
        submitButton.addEventListener('click', async () => {
            await this.saveSelectedTimeSlots(inputField.value, this.comboBox.value);
            document.body.removeChild(overlay);
        });

        const addTagButton = document.createElement('button');
        addTagButton.className = 'modal-button add-tag';
        addTagButton.textContent = 'Add New Tag';
        addTagButton.addEventListener('click', () => {
            this.showAddTagPopup();
        });

        const closeButton = document.createElement('button');
        closeButton.className = 'modal-button cancel';
        closeButton.textContent = 'Cancel';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(addTagButton);
        buttonContainer.appendChild(closeButton);

        modal.appendChild(title);
        modal.appendChild(timeSlotsList);
        modal.appendChild(inputField);
        modal.appendChild(this.comboBox);
        modal.appendChild(buttonContainer);

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // Update the save method to work with all views
async saveSelectedTimeSlots(taskDescription, selectedTag) {
        const userId = this.auth.currentUser?.uid;
        if (!userId) {
            Swal.fire("Error", "You need to be logged in to save tasks.", "error");
            return;
        }

        const selectedTagObj = this.tags.find(tag => tag.tagName === selectedTag);
        const tagColor = selectedTagObj ? selectedTagObj.color : "#ADD8E6";

        // Format the current date as YYYY-MM-DD
        const dateStr = `${viewManager.currentDate.getFullYear()}-${(viewManager.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${viewManager.currentDate.getDate().toString().padStart(2, '0')}`;

        const userTasksRef = ref(this.db, `userTasks/${userId}/${dateStr}`);
        const newTaskRef = push(userTasksRef);

        try {
            await set(newTaskRef, {
                task: taskDescription,
                selectedBoxes: this.selectedBoxes,
                totalTime: this.calculateTotalTime(),
                tag: selectedTag,
                color: tagColor,
                date: dateStr,
                timestamp: new Date().toISOString()
            });

            // Update the UI to show the saved time slots
            this.selectedBoxes.forEach(boxId => {
                const box = this.boxes.find(b => b.id === boxId);
                if (box) {
                    box.element.style.backgroundColor = tagColor;
                    box.element.style.color = "#fff";
                    box.element.classList.remove('selected');
                }
            });

            this.selectedBoxes = [];

            Swal.fire({
                title: "Saved!",
                text: "Your time slots have been saved successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });

        } catch (error) {
            console.error("Error saving time slots:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to save time slots. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    async deleteFunction() {
        const user = this.auth.currentUser;
        if (!user) {
            Swal.fire("Not Logged In", "You need to log in to delete tasks.", "error");
            return;
        }

        const currentDate = viewManager.currentDate;
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

        const userId = user.uid;
        const taskPath = `userTasks/${userId}/${dateStr}`;
        const userTasksRef = ref(this.db, taskPath);

        const selectedBoxes = this.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);

        console.log("Selected Boxes for Deletion:", selectedBoxes);

        if (selectedBoxes.length === 0) {
            Swal.fire("No Selection", "Please select at least one box before deleting.", "warning");
            return;
        }

        try {
            const snapshot = await get(userTasksRef);
            if (!snapshot.exists()) {
                Swal.fire("No Task Found", "No task found for this date.", "info");
                return;
            }

            const tasks = snapshot.val();
            let updates = {};

            for (const taskKey in tasks) {
                const task = tasks[taskKey];
                const updatedBoxes = task.selectedBoxes.filter(boxId => !selectedBoxes.includes(boxId));

                if (updatedBoxes.length === 0) {
                    // Remove entire task if no boxes left
                    updates[`${taskPath}/${taskKey}`] = null;
                } else {
                    // Calculate reduced time
                    const reducedTime = task.selectedBoxes
                        .filter(boxId => selectedBoxes.includes(boxId))
                        .reduce((total, boxId) => {
                            const box = this.boxes.find(b => b.id === boxId);
                            return total + (box ? box.TimeValue : 0);
                        }, 0);

                    const updatedTotalTime = Math.max(0, task.totalTime - reducedTime);

                    // Update task with remaining boxes and new total time
                    updates[`${taskPath}/${taskKey}/selectedBoxes`] = updatedBoxes;
                    updates[`${taskPath}/${taskKey}/totalTime`] = updatedTotalTime;
                }
            }

            // Perform all updates in a single transaction
            await update(ref(this.db), updates);

            // Reset UI
            this.selectedBoxes.forEach(boxId => {
                const box = this.boxes.find(b => b.id === boxId);
                if (box) {
                    box.element.style.backgroundColor = "";
                    box.element.style.color = "";
                    box.element.classList.remove('selected');
                }
            });

            this.selectedBoxes = [];
            this.retrievedData();

            Swal.fire("Deleted", "Selected time slots have been removed.", "success");

        } catch (error) {
            console.error("Error deleting boxes:", error);
            Swal.fire("Error", "Could not delete the selected boxes. Try again later.", "error");
        }
    }

    // Update the checkBoxes method to work with all views
    checkBoxes() {
        let hasError = false;
    
        for (const boxId of this.selectedBoxes) {
            const box = this.boxes.find(b => b.id === boxId);
            if (box) {
                const style = window.getComputedStyle(box.element);
                const backgroundColor = style.backgroundColor;
                const validColors = ['rgb(173, 216, 230)', 'rgb(61, 61, 61)'];
                
                if (!validColors.includes(backgroundColor)) {
                    hasError = true;
                    break;
                }
            }
        }
    
        if (hasError) {
            Swal.fire({
                title: "Error",
                text: "Some selected time slots already have tasks assigned!",
                icon: "error",
                confirmButtonText: "OK"
            });
        } else {
            this.showCustomPopup();
        }
    }

    // Add this method to retrieve data for the current date
    async retrievedData() {
        const userId = this.auth.currentUser?.uid;
        if (!userId) return;

        const dateStr = `${viewManager.currentDate.getFullYear()}-${(viewManager.currentDate.getMonth() + 1).toString().padStart(2, '0')}-${viewManager.currentDate.getDate().toString().padStart(2, '0')}`;
        const userTasksRef = ref(this.db, `userTasks/${userId}/${dateStr}`);

        try {
            const snapshot = await get(userTasksRef);
            this.resetBoxColors();

            if (snapshot.exists()) {
                const tasks = snapshot.val();
                Object.values(tasks).forEach(task => {
                    task.selectedBoxes.forEach(boxId => {
                        // Handle both day view boxes and week view time slots
                        const box = this.boxes.find(b => b.id === boxId);
                        if (box) {
                            box.element.style.backgroundColor = task.color;
                            box.element.style.color = "#fff";
                        }

                        // For week view
                        if (viewManager.viewSelector.value === 'week') {
                            const dayIndex = Math.floor((boxId - 1) / 48);
                            const timeIndex = (boxId - 1) % 48;
                            const timeSlot = document.querySelector(`.week-day-column[data-day-index="${dayIndex}"] .week-time-slot[data-time-index="${timeIndex}"]`);
                            if (timeSlot) {
                                timeSlot.style.backgroundColor = task.color;
                                timeSlot.style.color = "#fff";
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Error retrieving data:", error);
        }
    }

    // Update the showWeekView method in ViewManager to use this handler:
    addTimeSlotClickListener(timeSlot) {
        timeSlot.addEventListener('click', () => {
            const dayIndex = timeSlot.parentElement.dataset.dayIndex;
            const timeIndex = timeSlot.dataset.timeIndex;
            this.handleWeekBoxSelection(dayIndex, timeIndex);
        });
    }

    calculateTotalTime() {
        let totalTime = 0;
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

    hexToRgb(hex) {
        let r = parseInt(hex.slice(1,3),16),
        g = parseInt(hex.slice(3,5),16),
        b = parseInt(hex.slice(5,7),16)
    
        if(hex.length == 4) {
            r = parseInt(hex[1] + hex[1],16)
            g = parseInt(hex[2] + hex[2],16)
            b = parseInt(hex[3] + hex[3],16)
        }

        var total  =  (r+g+b);
        return total
    }

    sumRGB(rgbString) {
        const rgbValues = rgbString.match(/\d+/g).map(Number);
        return rgbValues.reduce((sum, value) => sum + value, 0);
    }
    
    showPopup() {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '1000';

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.style.backgroundColor = 'white';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
        modal.style.minWidth = '300px';
        modal.style.textAlign = 'center';

        const title = document.createElement('h2');
        title.textContent = "Choose you TagName and Color Please";

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter some text...';
        inputField.style.width = '100%';
        inputField.style.marginBottom = '10px';
        inputField.style.padding = '8px';

        var colorField = document.createElement('input');
        colorField.type = 'color';
        colorField.style.width = '40%';
        colorField.style.marginBottom = '10px';
        colorField.style.padding = '8px';
        colorField.style.marginRight = "70px";
        colorField.id = "colors";

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.style.backgroundColor = '#4CAF50';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.padding = '10px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.marginRight = '10px';
        submitButton.style.borderRadius = '5px';
        submitButton.addEventListener('click', () => {
            onAuthStateChanged(this.auth, (user) => {
                if(!user) {
                    console.log("User not logged in !!")
                }
                else {
                    let userId = user.uid;
                    var selectedColor = colorField.value;
            
                    console.log("Submit tag value is clicked ==> " + inputField.value);
                    console.log("color value is clicked ==>" + selectedColor);

                    const TotalRGBValue =  boxContainer.hexToRgb(selectedColor);
                    const savedLocal = JSON.parse(localStorage.getItem(`user_${userId}_tags`));

                    let isAllowed = savedLocal.every(task => {
                        return Math.abs(TotalRGBValue - this.hexToRgb(task.color)) > 100;
                    });
                    
                    if (isAllowed) {
                        alert("fine to go")
                        console.log("✅ Data is ready to go");
                        const tagSelect = document.getElementById('tagSelect');
                    
                        const UserTag = ref(this.db, 'userTasks/' + userId + "/tags");
                        const newTagRef = push(UserTag);
            
                        set(newTagRef, {
                            tagName: inputField.value,
                            color: selectedColor
                        }).then(() => {
                            console.log("Tag successfully added!");
                            return get(UserTag);
                        }).then(snapshot => {
                            if (snapshot.exists()) {
                                console.log("Tags found:");
                                console.log(snapshot.val());
            
                                Object.values(snapshot.val()).forEach(tag => {
                                    console.log("Tag Name:", tag.tagName + ", Color:", tag.color);
                                });
                                tagSelect.innerHTML = '';
                                this.saveTagsToLocalStorage(inputField.value, selectedColor, userId);
                                this.addTag(inputField.value, selectedColor);

                                Swal.fire({
                                    title: "Saved!",
                                    text: "Your New tag has been saved successfully.",
                                    icon: "success",
                                    confirmButtonText: "OK"
                                });
                            } else {
                                console.log("No tags found.");
                            }
                        }).catch(error => {
                            console.error("Error adding tag:", error);
                        });
                    } else {
                        alert("❌ Not allowed, please change color");
                        console.log("⛔ Stopped: Color too close");
                        Swal.fire({
                            title: "Error",
                            text: "There is Similar Color to Yours Please Change !",
                            icon: "error",
                            confirmButtonText: "OK"
                        });
                    }
                }
            });
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.backgroundColor = '#d9534f';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.padding = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.borderRadius = '5px';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        modal.appendChild(title);
        modal.appendChild(inputField);
        modal.appendChild(colorField);
        modal.appendChild(submitButton);
        modal.appendChild(closeButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    async showCustomPopup() {
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
            const userId = this.auth.currentUser?.uid;
            if (!userId) {
                console.error("User not authenticated");
                Swal.fire("Error", "User not authenticated.", "error");
                return;
            }

            const inputData = inputField.value;
            const selectedOption = this.comboBox.value;

            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
            let selectedTagColor = selectedTag ? selectedTag.color : "#000";

            if (selectedTag) {
                this.selectedBoxes.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = selectedTag.color;
                        box.element.style.color = "#fff";
                    }
                });
            }

            const groupedBoxes = {};
            this.selectedBoxes.forEach(boxId => {
                const box = this.boxes.find(b => b.id === boxId);
                if (box) {
                    const color = box.element.style.backgroundColor;
                    if (!groupedBoxes[color]) {
                        groupedBoxes[color] = [];
                    }
                    groupedBoxes[color].push(boxId);
                }
            });

            const currentDate = new Date();
            const givenDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
            const userTasksRef = ref(this.db, `userTasks/${userId}/${givenDate}`);

            try {
                const snapshot = await get(userTasksRef);
                let existingTasks = snapshot.val() || {};

                for (const [color, boxIds] of Object.entries(groupedBoxes)) {
                    let taskUpdated = false;
                    let existingTimestamp = null;

                    for (const [taskId, task] of Object.entries(existingTasks)) {
                        if (task.color === color) {
                            existingTimestamp = task.timestamp;
                            const existingBoxIds = task.selectedBoxes || [];
                            const newBoxIds = boxIds.filter(boxId => !existingBoxIds.includes(boxId));

                            if (newBoxIds.length > 0) {
                                task.selectedBoxes = [...new Set([...existingBoxIds, ...newBoxIds])];
                                task.totalTime += this.calculateTotalTime(newBoxIds);

                                await update(ref(this.db, `userTasks/${userId}/${givenDate}/${taskId}`), {
                                    selectedBoxes: task.selectedBoxes,
                                    totalTime: task.totalTime
                                });

                                taskUpdated = true;
                                console.log(`Updated task with color ${color} and added new boxes.`);
                            }
                            break;
                        }
                    }

                    if (!taskUpdated) {
                        const newTaskId = new Date().getTime().toString();
                        const newTimestamp = new Date().toISOString();

                        set(ref(this.db, `userTasks/${userId}/${givenDate}/${newTaskId}`), {
                            task: inputData,
                            selectedBoxes: boxIds,
                            totalTime: this.calculateTotalTime(boxIds),
                            tag: selectedOption,
                            color: color,
                            date: givenDate,
                            timestamp: existingTimestamp || newTimestamp
                        });

                        console.log(`Created new task with color ${color}.`);
                    }
                }

                console.log("Data saved/updated successfully");
                Swal.fire({
                    title: "Saved!",
                    text: "Your task has been saved/updated successfully.",
                    icon: "success",
                    confirmButtonText: "OK"
                });

            } catch (error) {
                console.error("Error saving/updating data:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to save/update data. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }

            this.selectedBoxes = [];
            this.boxes.forEach(box => {
                box.element.classList.remove('selected');
            });

            document.body.removeChild(overlay);
        });

        const addTagButton = document.createElement('button');
        addTagButton.classList.add('submitBTN');
        addTagButton.textContent = 'Add Tag';
        addTagButton.addEventListener('click', () => {
            this.showAddTagPopup();
        });

        const closeButton = document.createElement('button');
        closeButton.classList.add('submitBTN');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        modal.append(title, inputField, this.comboBox, submitButton, closeButton, addTagButton);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    saveTagsToLocalStorage(name, color, userId) {
        const userTagsKey = `user_${userId}_tags`;
        let storedTags = JSON.parse(localStorage.getItem(userTagsKey)) || [];
        storedTags.push({ name, color });
        localStorage.setItem(userTagsKey, JSON.stringify(storedTags));
        console.log(`Tag "${name}" saved for user ${userId}`);
    }

    addTag(tagName, color) {
        if (!this.tags.some(tag => tag.tagName === tagName)) {
            this.tags.push(new Tag(tagName, color));
            this.populateComboBox();
        }
    }

    async updateTask(userId, taskKey, updatedTaskData) {
        const taskRef = ref(this.db, 'userTasks/' + userId + '/' + taskKey);

        try {
            await set(taskRef, updatedTaskData);
            console.log("Task updated successfully");
            Swal.fire({
                title: "Updated!",
                text: "The task has been updated successfully.",
                icon: "success",
                confirmButtonText: "OK"
            });
        } catch (error) {
            console.error("Error updating task:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to update the task. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    async updateSingleBoxTask(userId, taskKey, updatedTaskData, selectedBoxesToUpdate) {
        const taskRef = ref(this.db, 'userTasks/' + userId + '/' + taskKey);
        const userTasksRef = ref(this.db, 'userTasks/' + userId);

        try {
            if (!Array.isArray(selectedBoxesToUpdate)) {
                console.error("selectedBoxesToUpdate is not an array:", selectedBoxesToUpdate);
                Swal.fire("Error", "Selected boxes to update is invalid. Please try again.", "error");
                return;
            }

            console.log("Selected Boxes to Update:", selectedBoxesToUpdate);

            const snapshot = await get(taskRef);
            if (snapshot.exists()) {
                let taskData = snapshot.val();

                if (!Array.isArray(taskData.selectedBoxes)) {
                    console.log("taskData.selectedBoxes is not an array, initializing it.");
                    taskData.selectedBoxes = [];
                }

                console.log("Task Data retrieved:", taskData);

                const timeToRemove = selectedBoxesToUpdate.reduce((total, boxId) => {
                    const box = this.boxes.find(b => b.id === boxId);
                    return total + (box ? box.TimeValue : 0);
                }, 0);

                taskData.selectedBoxes = taskData.selectedBoxes.filter(
                    boxId => !selectedBoxesToUpdate.includes(boxId)
                );

                taskData.totalTime -= timeToRemove;

                if (taskData.selectedBoxes.length === 0) {
                    await remove(taskRef);
                    console.log("Previous task deleted as no boxes remain.");
                } else {
                    await set(taskRef, taskData);
                    console.log("Original task updated successfully");
                }

                const allTasksSnapshot = await get(userTasksRef);
                let existingTaskKey = null;
                let existingTaskData = null;

                if (allTasksSnapshot.exists()) {
                    allTasksSnapshot.forEach((childSnapshot) => {
                        const childTask = childSnapshot.val();
                        if (childTask.color === updatedTaskData.color) {
                            existingTaskKey = childSnapshot.key;
                            existingTaskData = childTask;
                        }
                    });
                }

                if (existingTaskKey) {
                    existingTaskData.selectedBoxes = [...existingTaskData.selectedBoxes, ...selectedBoxesToUpdate];
                    existingTaskData.totalTime += timeToRemove;
                    await set(ref(this.db, 'userTasks/' + userId + '/' + existingTaskKey), existingTaskData);
                    console.log("Merged with existing task", existingTaskKey);
                } else {
                    const newTaskData = {
                        task: updatedTaskData.task,
                        selectedBoxes: selectedBoxesToUpdate,
                        totalTime: timeToRemove,
                        tag: updatedTaskData.tag,
                        color: updatedTaskData.color,
                        timestamp: new Date().toISOString()
                    };

                    const newTaskRef = ref(this.db, 'userTasks/' + userId + '/' + new Date().getTime());
                    await set(newTaskRef, newTaskData);
                    console.log("New task created for updated boxes");
                }

                selectedBoxesToUpdate.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = updatedTaskData.color;
                        box.element.style.color = "#fff";
                    }
                });

                Swal.fire({
                    title: "Updated!",
                    text: "The updated boxes have been moved.",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            } else {
                console.error("No task found for the provided taskKey.");
                Swal.fire("Error", "Failed to find the task to update. Please try again.", "error");
            }
        } catch (error) {
            console.error("Error updating task:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to update task data. Please try again. Error: " + error.message,
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }

    retrievedData() {
        let TaskFound = false;
        const currentDate = new Date();
        const givenDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

        onAuthStateChanged(this.auth, async (user) => {
            if (!user) {
                console.log("User not logged in (retrievedData function)");
                return;
            }

            console.log("User is logged in:", user.uid);
            const userTasksRef = ref(this.db, `userTasks/${user.uid}/${givenDate}`);

            try {
                const snapshot = await get(userTasksRef);

                if (!snapshot.exists()) {
                    console.log(`No tasks found for ${givenDate}`);
                    Swal.fire("No Task Found", `No tasks found for ${givenDate}`, "info");
                    this.resetBoxColors();
                    return;
                }

                const tasks = snapshot.val();
                console.log("Retrieved Data:", tasks);

                this.resetBoxColors();

                Object.values(tasks).forEach(task => {
                    console.log(`Matching task found for ${givenDate}`);
                    TaskFound = true;

                    task.selectedBoxes.forEach(boxId => {
                        const box = this.boxes.find(b => b.id === boxId);
                        if (box) {
                            box.element.style.backgroundColor = task.color;
                            box.element.style.color = "#fff";
                        }
                    });
                });

                if (!TaskFound) {
                    Swal.fire("No Task Found", `No tasks found for ${givenDate}`, "info");
                }
            } catch (error) {
                console.error("Error retrieving data:", error);
                Swal.fire("Error", "Failed to retrieve tasks. Please try again.", "error");
            }
        });
    }

    resetBoxColors() {
        // Reset day view boxes
        this.boxes.forEach(box => {
            box.element.style.backgroundColor = "";
            box.element.style.color = "";
            box.element.classList.remove("selected");
        });

        // Reset week view time slots
        if (viewManager.viewSelector.value === 'week') {
            document.querySelectorAll('.week-time-slot').forEach(slot => {
                slot.style.backgroundColor = "";
                slot.style.color = "";
                slot.classList.remove("selected");
            });
        }

        // Reset month view cells
        if (viewManager.viewSelector.value === 'month') {
            document.querySelectorAll('.month-cell').forEach(cell => {
                cell.classList.remove("selected-day");
            });
        }

        // Reset year view cells
        if (viewManager.viewSelector.value === 'year') {
            document.querySelectorAll('.year-day-cell').forEach(cell => {
                cell.classList.remove("selected-day");
            });
        }
    }

    showUpdateTaskPopup() {
        const user = this.auth.currentUser;
        if (!user) {
            Swal.fire("Not Logged In", "You need to log in to update tasks.", "error");
            return;
        }

        const userId = user.uid;
        const selectedBoxes = this.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);

        if (selectedBoxes.length === 0) {
            Swal.fire({
                title: "No Boxes Selected",
                text: "Please select at least one box before proceeding.",
                icon: "warning",
                confirmButtonText: "OK",
                showClass: { popup: "animate__animated animate__shakeX animate__faster" }
            });
            return;
        }

        let selectedBoxesMessage = selectedBoxes.map(id => this.getTimeSlot(id)).join(', ');

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        const modal = document.createElement('div');
        modal.classList.add('modal');
        const title = document.createElement('h2');
        title.textContent = `Update Task for Selected Boxes: ${selectedBoxesMessage}`;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Enter new task details here...';

        this.populateComboBox();

        const submitButton = document.createElement('button');
        submitButton.classList.add('submitBTN');
        submitButton.textContent = 'Update';

        submitButton.addEventListener('click', async () => {
            const inputData = inputField.value;
            const selectedOption = this.comboBox.value;

            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
            const selectedTagColor = selectedTag ? selectedTag.color : "#000";

            const selectedBoxesToUpdate = selectedBoxes;

            const updatedTaskData = {
                task: inputData,
                selectedBoxes: selectedBoxes,
                totalTime: this.calculateTotalTime(),
                tag: selectedOption,
                color: selectedTagColor,
                timestamp: new Date().toISOString()
            };

            const taskRef = ref(this.db, 'userTasks/' + userId);
            const snapshot = await get(taskRef);

            if (snapshot.exists()) {
                let taskKey = null;
                snapshot.forEach(childSnapshot => {
                    const data = childSnapshot.val();
                    taskKey = childSnapshot.key;
                });

                if (taskKey) {
                    Swal.fire({
                        title: "Update Task?",
                        text: `Are you sure you want to update the task?`,
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Yes, Update",
                        cancelButtonText: "Cancel"
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await this.updateSingleBoxTask(userId, taskKey, updatedTaskData, selectedBoxesToUpdate);

                            this.selectedBoxes.forEach(boxId => {
                                const box = this.boxes.find(b => b.id === boxId);
                                if (box) {
                                    box.element.style.backgroundColor = selectedTagColor;
                                    box.element.style.color = "#fff";
                                }
                                boxContainer.boxes.forEach(box => {
                                    if (box.element.classList.contains('selected')) {
                                        box.element.classList.remove('selected');
                                    }
                                });
                            });
                        }
                    });
                } else {
                    Swal.fire("Not Found", "No matching task found to update.", "info");
                }
            }
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

    checkUpdateValitading() {
        console.log("Checking Boxes");
        let hasError = false;

        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;

            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (backgroundColor == 'rgb(173, 216, 230)') {
                    hasError = true;
                    break;
                }
            }
        }

        if (hasError) {
            Swal.fire({
                title: "Error",
                text: "Some selected boxes already have a background!",
                icon: "error",
                confirmButtonText: "OK"
            });
        } else {
            boxContainer.showCustomPopup();
        }
    }

    checkBoxes() {
        console.log("Checking Boxes121");
        console.trace();
    
        let hasError = false;
    
        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;
    
            const validColors = ['rgb(173, 216, 230)', 'rgb(61, 61, 61)'];
    
            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (!validColors.includes(backgroundColor)) {
                    hasError = true;
                    break;
                }
            }
        }
    
        if (hasError) {
            Swal.fire({
                title: "Error",
                text: "Some selected boxes already have a background!",
                icon: "error",
                confirmButtonText: "OK"
            });
        } else {
            boxContainer.showCustomPopup();
        }
    }
    
    async deleteFunction() {
        const user = auth.currentUser;
        if (!user) {
            Swal.fire("Not Logged In", "You need to log in to delete tasks.", "error");
            return;
        }

        const currentDate = new Date();
        const givenDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;

        const userId = user.uid;
        const taskPath = `userTasks/${userId}/${givenDate}`;
        const userTasksRef = ref(db, taskPath);

        const selectedBoxes = boxContainer.boxes
            .filter(box => box.element.classList.contains('selected'))
            .map(box => box.id);

        console.log("Selected Boxes for Deletion:", selectedBoxes);

        if (selectedBoxes.length === 0) {
            Swal.fire("No Selection", "Please select at least one box before deleting.", "warning");
            return;
        }

        try {
            const snapshot = await get(userTasksRef);
            if (!snapshot.exists()) {
                Swal.fire("No Task Found", "No task found for this date.", "info");
                return;
            }

            const tasks = snapshot.val();

            for (const taskKey in tasks) {
                const task = tasks[taskKey];
                const updatedBoxes = task.selectedBoxes.filter(boxId => !selectedBoxes.includes(boxId));

                if (updatedBoxes.length === 0) {
                    await remove(ref(db, `${taskPath}/${taskKey}`));
                    console.log(`Deleted entire task: ${taskKey}`);
                } else {
                    const reducedTime = task.selectedBoxes
                        .filter(boxId => selectedBoxes.includes(boxId))
                        .reduce((total, boxId) => {
                            const box = boxContainer.boxes.find(b => b.id === boxId);
                            return total + (box && box.TimeValue ? box.TimeValue : 0);
                        }, 0);

                    const updatedTotalTime = Math.max(0, task.totalTime - reducedTime);

                    await update(ref(db, `${taskPath}/${taskKey}`), {
                        selectedBoxes: updatedBoxes,
                        totalTime: updatedTotalTime
                    });

                    console.log(`Updated task: ${taskKey}, New Total Time: ${updatedTotalTime}`);
                }
            }

            boxContainer.retrievedData();
            Swal.fire("Deleted", "selected  have been removed.", "success");

        } catch (error) {
            console.error("Error deleting boxes:", error);
            Swal.fire("Error", "Could not delete the selected boxes. Try again later.", "error");
        }
    }

    checkDeleteFunction() {
        console.log("Checking Boxes");
        let hasError = false;

        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;

            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (backgroundColor == 'rgb(173, 216, 230)') {
                    hasError = true;
                    break;
                }
            }
        }

        if (hasError) {
            Swal.fire({
                title: "Error",
                text: "Some selected boxes already have a background!",
                icon: "error",
                confirmButtonText: "OK"
            });
        } else {
            boxContainer.deletèFunction();
        }
    }
}