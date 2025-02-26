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




    async showAddTagPopup() {
        console.log("Showing Add Tag Popup");
        boxContainer.showPopup();


    }

        hexToRgb(hex) { // #f3g4h1 ==> 00 255 00

            let r = parseInt(hex.slice(1,3),16),
            g = parseInt(hex.slice(3,5),16),
            b = parseInt(hex.slice(5,7),16)
        
            if(hex.length == 4) {
                r = parseInt(hex[1] + hex[1],16)
                g = parseInt(hex[2] + hex[2],16)
                b = parseInt(hex[3] + hex[3],16)
        
            }

            var total  =  (r+g+b) ;

            return total
    
        
    }

    sumRGB(rgbString) {
        // Extract numbers from the rgb() format
        const rgbValues = rgbString.match(/\d+/g).map(Number);
        
        // Sum up the RGB values
        return rgbValues.reduce((sum, value) => sum + value, 0);
    }
    
    // console.log(sumRGB("rgb(0, 128, 0)")); // Output: 128
    

    showPopup() {
        // Create the overlay (background blur effect)
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
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

                    var selectedColor = colorField.value; //f3f3f3
            
                    console.log("Submit tag value is clicked ==> " + inputField.value);
                    console.log("color value is clicked ==>" + selectedColor);

                    const TotalRGBValue =  boxContainer.hexToRgb(selectedColor);

                    const savedLocal = JSON.parse(localStorage.getItem(`user_${userId}_tags`));

                    
                    // console.log( `User's color range ==> ${TotalRGBValue} ==> All the colors we have  ==> ${this.sumRGB(task.color)}` );


                    let isAllowed = savedLocal.every(task => {
                        return Math.abs(TotalRGBValue - this.hexToRgb(task.color)) > 100;
                    });
                    
                    if (isAllowed) {
                        alert("fine to go")
                        console.log("✅ Data is ready to go");
                        // console.log(TotalRGBValue + "==>(-)" + this.hexToRgb(task.color) )

                        const tagSelect = document.getElementById('tagSelect');



                    
            
                        const UserTag = ref(this.db, 'userTasks/' + userId + "/tags");
            
                        // Generate a unique ID for each tag
                        const newTagRef = push(UserTag);
            
                        set(newTagRef, {
                            tagName: inputField.value,
                            color: selectedColor
                        }).then(() => {
                            console.log("Tag successfully added!");
            
                            // Fetch the updated tag list
                            return get(UserTag);
                        }).then(snapshot => {
                            if (snapshot.exists()) {
                                console.log("Tags found:");
                                console.log(snapshot.val());
            
            
            
                                Object.values(snapshot.val()).forEach(tag => {
                                    console.log("Tag Name:", tag.tagName + ", Color:", tag.color);
                                });
                                tagSelect.innerHTML = ''; // Clear the existing options
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
                        // console.log(TotalRGBValue + "==>(-)" + this.hexToRgb(task.color) )
                    }
                    
                    
                        }
                    })

            

            


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

        // Append modal to overlay
        overlay.appendChild(modal);

        // Append overlay to the document body
        document.body.appendChild(overlay);
    }

    // Example: Attach to a button click event
   


    async showCustomPopup() {
        // Refill selectedBoxes with currently selected boxes
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

            // Get user-selected date
            let day = document.getElementById("dayComboBox").value;
            let month = document.getElementById("monthComboBox").value;
            let year = document.getElementById("yearComboBox").value;

            day = day.padStart(2, '0');
            month = month.padStart(2, '0');

            const givenDate = `${year}-${month}-${day}`;

            const selectedTag = this.tags.find(tag => tag.tagName === selectedOption);
            let selectedTagColor = selectedTag ? selectedTag.color : "#000"; // Default color

            if (selectedTag) {
                this.selectedBoxes.forEach(boxId => {
                    const box = this.boxes.find(b => b.id === boxId);
                    if (box) {
                        box.element.style.backgroundColor = selectedTag.color;
                        box.element.style.color = "#fff";
                    }
                });
            }

            // Group selected boxes by their background color
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

            // Reference to tasks for the selected date
            const userTasksRef = ref(this.db, `userTasks/${userId}/${givenDate}`);

            try {
                const snapshot = await get(userTasksRef);
                let existingTasks = snapshot.val() || {};

                // Check if a task with the same color and selected boxes already exists
                for (const [color, boxIds] of Object.entries(groupedBoxes)) {
                    let taskUpdated = false;
                    let existingTimestamp = null;

                    // Loop through existing tasks to check for existing color and timestamp
                    for (const [taskId, task] of Object.entries(existingTasks)) {
                        if (task.color === color) {
                            existingTimestamp = task.timestamp; // Store the existing timestamp
                            // Check if any of the selected boxes are already part of the task
                            const existingBoxIds = task.selectedBoxes || [];
                            const newBoxIds = boxIds.filter(boxId => !existingBoxIds.includes(boxId)); // Only include new boxes

                            if (newBoxIds.length > 0) {
                                // If there are new boxes, update the task
                                task.selectedBoxes = [...new Set([...existingBoxIds, ...newBoxIds])];
                                task.totalTime += this.calculateTotalTime(newBoxIds); // Only add time for the new boxes

                                await update(ref(this.db, `userTasks/${userId}/${givenDate}/${taskId}`), {
                                    selectedBoxes: task.selectedBoxes,
                                    totalTime: task.totalTime
                                });

                                taskUpdated = true;
                                console.log(`Updated task with color ${color} and added new boxes.`);
                            }
                            break; // Break out of the loop once we find a matching task
                        }
                    }

                    // If no task with the same color exists, create a new task with a new timestamp
                    if (!taskUpdated) {
                        const newTaskId = new Date().getTime().toString();
                        const newTimestamp = new Date().toISOString(); // Create a new timestamp

                        set(ref(this.db, `userTasks/${userId}/${givenDate}/${newTaskId}`), {
                            task: inputData,
                            selectedBoxes: boxIds,
                            totalTime: this.calculateTotalTime(boxIds), // Calculate total time for these new boxes
                            tag: selectedOption,
                            color: color,
                            date: givenDate,
                            timestamp: existingTimestamp || newTimestamp // Use existing timestamp if available, otherwise use new one
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

            // Reset selection
            this.selectedBoxes = [];
            this.boxes.forEach(box => {
                box.element.classList.remove('selected');
            });

            document.body.removeChild(overlay);
        });

        //AddTag button
        const addTagButton = document.createElement('button');
        addTagButton.classList.add('submitBTN');
        addTagButton.textContent = 'Add Tag';
        addTagButton.addEventListener('click', () => {
            this.showAddTagPopup();
        });


        // Close Button
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
        let TaskFound = false;

        // Get the selected date from dropdowns
        let day = document.getElementById("dayComboBox").value;
        let month = document.getElementById("monthComboBox").value;
        let year = document.getElementById("yearComboBox").value;

        // Ensure proper formatting (e.g., 01 instead of 1)
        day = day.padStart(2, '0');
        month = month.padStart(2, '0');

        const givenDate = `${year}-${month}-${day}`;

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

                // Reset all boxes before applying new colors
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


    // Helper function to reset all box colors
    resetBoxColors() {
        this.boxes.forEach(box => {
            box.element.style.backgroundColor = "";
            box.element.style.color = "";
            box.element.classList.remove("selected");
        });
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
                            await this.updateSingleBoxTask(userId, taskKey, updatedTaskData, selectedBoxesToUpdate);

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

    checkUpdateValitading() {
        console.log("Checking Boxes");

        let hasError = false; // Flag to track if an error occurs

        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;

            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (backgroundColor == 'rgb(173, 216, 230)') { // 'lightblue' in RGB format
                    hasError = true; // Mark that we found an invalid box
                    break; // Stop checking further boxes
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
            boxContainer.showCustomPopup(); // Only runs if no error occurred
        }

    }

    checkBoxes() {
        console.log("Checking Boxes121");
        console.trace();
    
        let hasError = false; // Flag to track if an error occurs
    
        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;
    
            // Possible background colors in both light and dark mode
            const validColors = ['rgb(173, 216, 230)', 'rgb(61, 61, 61)']; // Light blue & Dark gray (#3d3d3d)
    
            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (!validColors.includes(backgroundColor)) {
                    hasError = true; // Mark that we found an invalid box
                    break; // Stop checking further boxes
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
            boxContainer.showCustomPopup(); // Only runs if no error occurred
        }
    }
    

    async deletFunction() {
        const user = auth.currentUser;
        if (!user) {
            Swal.fire("Not Logged In", "You need to log in to delete tasks.", "error");
            return;
        }

        let day = document.getElementById("dayComboBox").value;
        let month = document.getElementById("monthComboBox").value;
        let year = document.getElementById("yearComboBox").value;

        day = day.padStart(2, '0');
        month = month.padStart(2, '0');
        const givenDate = `${year}-${month}-${day}`;

        const userId = user.uid;
        const taskPath = `userTasks/${userId}/${givenDate}`;
        const userTasksRef = ref(db, taskPath);

        // Get the selected boxes
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

            // Iterate over all tasks and remove selected boxes only
            for (const taskKey in tasks) {
                const task = tasks[taskKey];

                // Get boxes that will remain after deletion
                const updatedBoxes = task.selectedBoxes.filter(boxId => !selectedBoxes.includes(boxId));

                if (updatedBoxes.length === 0) {
                    // If no boxes are left, delete the task entry
                    await remove(ref(db, `${taskPath}/${taskKey}`));
                    console.log(`Deleted entire task: ${taskKey}`);
                } else {
                    // Calculate reduced time **only for boxes that belong to THIS task**
                    const reducedTime = task.selectedBoxes
                        .filter(boxId => selectedBoxes.includes(boxId)) // Only consider removed boxes
                        .reduce((total, boxId) => {
                            const box = boxContainer.boxes.find(b => b.id === boxId);
                            return total + (box && box.TimeValue ? box.TimeValue : 0);
                        }, 0);

                    const updatedTotalTime = Math.max(0, task.totalTime - reducedTime); // Ensure it doesn't go negative

                    // Update only the selectedBoxes and totalTime fields
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

        let hasError = false; // Flag to track if an error occurs

        for (const box of this.boxes) {
            const boxElement = box.element;
            const style = window.getComputedStyle(boxElement);
            const backgroundColor = style.backgroundColor;

            if (boxContainer.selectedBoxes.includes(box.id)) {
                if (backgroundColor == 'rgb(173, 216, 230)') { // 'lightblue' in RGB format
                    hasError = true; // Mark that we found an invalid box
                    break; // Stop checking further boxes
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
            boxContainer.deletFunction(); // Only runs if no error occurred
        }
    }




}


document.addEventListener('DOMContentLoaded', async () => {
    const submitBTN = document.getElementById('saveBoxes');

    if (!boxContainer || typeof boxContainer.addTag !== 'function') {
        console.error("boxContainer or addTag function is not defined!");
        return;
    }

    async function initializeTags() {
        onAuthStateChanged(boxContainer.auth, (user) => {
            if (!user) {
                console.error("User not authenticated");
                return;
            }

            const userTagsKey = `user_${user.uid}_tags`;
            let storedTags = JSON.parse(localStorage.getItem(userTagsKey)) || [];

            const predefinedTags = [
                { name: "Work", color: "#ff0000" },
                { name: "Personal Dev", color: "#a52a2a" },
                { name: "School", color: "#008000" },
                { name: "FunTime", color: "#0000ff" },
                { name: "Team Time", color: "#800080" }
            ];

            predefinedTags.forEach(preTag => {
                if (!storedTags.some(tag => tag.name === preTag.name)) {
                    storedTags.push(preTag);
                }
            });

            localStorage.setItem(userTagsKey, JSON.stringify(storedTags));

            storedTags.forEach(tag => boxContainer.addTag(tag.name, tag.color));
        });
    }

    initializeTags();

    // Ensure no duplicate event listeners
    submitBTN?.removeEventListener('click', handleSaveBoxes);
    submitBTN?.addEventListener('click', handleSaveBoxes);
});

function handleSaveBoxes(event) {
    event.preventDefault(); // Prevent any accidental form submission
    console.log("Calling checkBoxes() at", new Date().toISOString());
    boxContainer.checkBoxes();
}



document.addEventListener('DOMContentLoaded', () => {
    const deleteBTN = document.getElementById('DeleteBoxes');

    deleteBTN.addEventListener('click', () => {
        boxContainer.checkDeleteFunction();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    boxContainer.retrievedData();

});



document.addEventListener('DOMContentLoaded', () => {
    const updateBTN = document.getElementById('UpdateTask');

    if (updateBTN) {
        updateBTN.addEventListener('click', () => boxContainer.checkUpdateValitading());
    } else {
        console.error('Button with ID "UpdateTask" not found!');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const selectedDate = document.getElementById("getDayButton");

    selectedDate.addEventListener("click", () => {


        boxContainer.retrievedData();
    })
});
