class BoxContainer {
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

    async showCustomPopup() {
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
    
            // Group selected boxes by their current background color
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
    
            // Check if a task with the same color already exists in the database
            const userId = this.auth.currentUser.uid;
            const userTasksRef = ref(this.db, `userTasks/${userId}`);
    
            try {
                const snapshot = await get(userTasksRef);
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const taskData = childSnapshot.val();
                        const taskColor = taskData.color;
    
                        // If a task with the same color exists, update it
                        if (groupedBoxes[taskColor]) {
                            const updatedSelectedBoxes = [...taskData.selectedBoxes, ...groupedBoxes[taskColor]];
                            const updatedTotalTime = taskData.totalTime + this.calculateTotalTime();
    
                            // Update the existing task
                            update(childSnapshot.ref, {
                                selectedBoxes: updatedSelectedBoxes,
                                totalTime: updatedTotalTime
                            });
    
                            // Remove the color from groupedBoxes since it's been handled
                            delete groupedBoxes[taskColor];
                        }
                    });
                }
    
                // Create new tasks for any remaining color groups
                for (const [color, boxIds] of Object.entries(groupedBoxes)) {
                    const taskRef = ref(this.db, `userTasks/${userId}/${new Date().getTime()}`); // New timestamp
    
                    set(taskRef, {
                        task: inputData,
                        selectedBoxes: boxIds,
                        totalTime: this.calculateTotalTime(),
                        tag: selectedOption,
                        color: color,
                        timestamp: new Date().toISOString()
                    });
                }
    
                console.log("Data saved/updated in Realtime Database successfully");
                Swal.fire({
                    title: "Saved!",
                    text: "Your task has been saved/updated successfully.",
                    icon: "success",
                    confirmButtonText: "OK"
                });
            } catch (error) {
                console.error("Error saving/updating to Realtime Database:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to save/update data. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK"
                });
            }
    
            // Reset selection
            this.selectedBoxes = [];
    
            // Remove 'selected' class from boxes so UI updates
            this.boxes.forEach(box => {
                box.element.classList.remove('selected');
            });
    
            document.body.removeChild(overlay);
        });

        const addTagBtn = document.createElement('button');
        addTagBtn.classList.add('submitBTN');
        addTagBtn.textContent = 'Add Tag';
        addTagBtn.addEventListener('click', () => {
            const tagName = prompt("Enter the tag name:");
            const tagColor = prompt("Enter the tag color:");
            
            if(tagName && tagColor) {

                this.addTag(tagName, tagColor);


                this.saveTagsToLocalStorage(tagName, tagColor);
            }

            console.log("Add Tag Button Clicked");

            
        });
    
    
        const closeButton = document.createElement('button');
        closeButton.classList.add('submitBTN');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    
        modal.append(title, inputField, this.comboBox, submitButton, closeButton, addTagBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    saveTagsToLocalStorage(name, color) {
        let storedTags = JSON.parse(localStorage.getItem('tags')) || [];
        storedTags.push({ name, color });
        localStorage.setItem('tags', JSON.stringify(storedTags));

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
    

    
                // Check for an existing task with the same color
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
                    // Merge with the existing task
                    existingTaskData.selectedBoxes = [...existingTaskData.selectedBoxes, ...selectedBoxesToUpdate];
                    existingTaskData.totalTime += timeToRemove;
                    await set(ref(this.db, 'userTasks/' + userId + '/' + existingTaskKey), existingTaskData);
                    console.log("Merged with existing task", existingTaskKey);
                } else {
                    // Create a new task if no matching color is found
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

        onAuthStateChanged(this.auth, (user) => {
            if (!user) {
                console.log("User not logged in (retrievedData function)");
                return;
            }
    
            console.log("User is logged in:", user.uid);
            const retrievedData = ref(this.db, `userTasks/${user.uid}`);
    
        onValue(retrievedData, (snapshot) => {
                const datas = snapshot.val();
                console.log("Retrieved Data:", datas);


                Object.values(datas).forEach(data => {
                    console.log("selected boxes: " + data.selectedBoxes);
                    console.log("task: " + data.task);
                    console.log("timeStamp: " + data.timestamp);

                    const timeStamp = data.timestamp;

                    if(timeStamp) {
                        const date = new Date(timeStamp).toISOString().split('T')[0];
                        console.log("Date: " + date);
                        const currentDate = new Date().toISOString().split('T')[0];
                        console.log("Current Date: " + currentDate);


                        if(date == currentDate) {
                            data.selectedBoxes.forEach(boxId => {
                                const box = this.boxes.find(b => b.id === boxId);
                                if (box) {
                                    box.element.style.backgroundColor = data.color;
                                    box.element.style.color = "#fff";
                                }
                            });
                            
                        } else {
                        Swal.fire("No Task Found", "No task found for today", "info");

                        }

                    }else {
                        Swal.fire("No TimeStamp Found", "No TimeStamp found for today !", "info");
                        console.log("No timestamp found");
                    }
                });
            });


        });
    }

   async ShowData(Day, Month, Year) {
        let UserTask =  ref(this.db, 'userTasks/' + userId);
        let snapshot = await get(UserTask);

        if(snapshot.exists() ){
            console.log("Task is found");
            console.log(snapshot.val());
        } else {
            console.log("Task is not found");
        }
    }
    
    
    
    
    

    // Function to show the update task popup
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
        const selectedTagColor = selectedTag ? selectedTag.color : "#000"; // Default color if none selected

        const selectedBoxesToUpdate = selectedBoxes;

        // Prepare the updated task data
        const updatedTaskData = {
            task: inputData,
            selectedBoxes: selectedBoxes,
            totalTime: this.calculateTotalTime(),
            tag: selectedOption,
            color: selectedTagColor,
            timestamp: new Date().toISOString()  // Update timestamp
        };

        // Get the task data to update from the database
        const taskRef = ref(this.db, 'userTasks/' + userId);
        const snapshot = await get(taskRef);

        if (snapshot.exists()) {
            let taskKey = null;
            snapshot.forEach(childSnapshot => {
                const data = childSnapshot.val();
                
                    taskKey = childSnapshot.key;
                
            });

            if (taskKey) {
                // Confirm the update with SweetAlert
                Swal.fire({
                    title: "Update Task?",
                    text: `Are you sure you want to update the task?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Update",
                    cancelButtonText: "Cancel"
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await this.updateSingleBoxTask(userId, taskKey, updatedTaskData,selectedBoxesToUpdate);

                        // Update the UI for the selected boxes with the new tag color
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

}


document.addEventListener('DOMContentLoaded', () => {
    const submitBTN = document.getElementById('saveBoxes');

    const initializeTags = () => {
        let storedTags = JSON.parse(localStorage.getItem('tags'));

        if (!storedTags || storedTags.length === 0) {
            storedTags = [
                { name: "Work", color: "red" },
                { name: "Personal Dev", color: "brown" },
                { name: "School", color: "green" },
                { name: "FunTime", color: "Blue" },
                { name: "Team Time", color: "purple" }
            ];
            localStorage.setItem('tags', JSON.stringify(storedTags)); // Save default tags if none exist
        } 
    
        storedTags.forEach(tag => boxContainer.addTag(tag.name, tag.color)); 
    };
    initializeTags();

    if (submitBTN) {
        submitBTN.addEventListener('click', () => boxContainer.showCustomPopup());
    } else {
        console.error('Button with ID "saveBoxes" not found!');
    }

    // console.log("Document is Loaded");


});

document.addEventListener('DOMContentLoaded', () => { boxContainer.retrievedData(); });



document.addEventListener('DOMContentLoaded', () => {
    const deleteBTN = document.getElementById('DeleteBoxes');

    if (deleteBTN) {
        deleteBTN.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (!user) {
                Swal.fire("Not Logged In", "You need to log in to delete tasks.", "error");
                return;
            }

            const userId = user.uid;
            const taskPath = `userTasks/${userId}`;
            const userTasksRef = ref(db, taskPath);

            // Get the selected boxes
            const selectedBoxes = boxContainer.boxes
                .filter(box => box.element.classList.contains('selected'))
                .map(box => box.id);

            console.log("Selected Boxes for Deletion:", selectedBoxes); // Debugging log

            if (selectedBoxes.length === 0) {
                Swal.fire("No Selection", "Please select at least one box before deleting.", "warning");
                return;
            }

            try {
                const snapshot = await get(userTasksRef);
                const getValue = snapshot.val();

                if (snapshot.exists()) {
                    const data = snapshot.val();

                    Object.keys(data).forEach(key => {
                        if(arraysEqual(data[key].selectedBoxes, this.selectedBoxes)) {
                            remove(ref(db, `${taskPath}/${key}`));
                        }
                    });
                }

                if(this.selectedBoxes) {

                } else {

                }

            } catch (error) {
                console.error("Error deleting boxes:", error);
                Swal.fire("Error", "Could not delete the selected boxes. Try again later.", "error");
            }
        });
    } else {
        console.error('Button with ID "DeleteBoxes" not found!');
    }
});



document.addEventListener('DOMContentLoaded', () => {
    const updateBTN = document.getElementById('UpdateTask');

    if (updateBTN) {
        updateBTN.addEventListener('click', () => boxContainer.showUpdateTaskPopup());
    } else {
        console.error('Button with ID "UpdateTask" not found!');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const selectedDate =  document.getElementById("getSelectedDate");

    selectedDate.addEventListener("click", () => {
        boxContainer.ShowData();
        let day = document.getElementById("dayComboBox").value;
        let month = document.getElementById("monthComboBox").value;
        let Year = document.getElementById("yearComboBox").value;

        if(day < 10) {
            day = `0${day}`;
        }

        if(month < 10) {
            month = `0${month}`;    
        }

        try {
            const UserTask = ref

        }catch(e) {
            console.log(e.message);
        }

        console.log("Selected Day: " +  day);
        console.log("Selected month: " +  month);
        console.log("Selected Year: " +  Year);

        const selectedDate = `${Year}-${month}-${day}`;
       

        console.log(selectedDate);
    })
});

// Function to compare two arrays (order-independent)
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(value => arr2.includes(value)) && arr2.every(value => arr1.includes(value));
}