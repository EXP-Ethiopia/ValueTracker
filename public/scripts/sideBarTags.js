

// Function to fetch and display categories from local storage
function fetchCategoriesFromLocalStorage() {
    // Get the ul element where categories will be inserted
    const categoryList = document.getElementById('category-list');

    // Clear any existing list items
    categoryList.innerHTML = '';

    // Fetch categories from local storage
    const categories = JSON.parse(localStorage.getItem(`user_${userId}_tags`)) || [];
    console.log(userId + "from the sidebar js")

    // Loop through the categories and create list items
    categories.forEach((category, index) => {
        const listItem = document.createElement('li');
        listItem.className = `category-item ${category.class}`;
        listItem.textContent = category.name;

        // Apply the background color from the category data
        listItem.style.backgroundColor = category.color;

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.marginLeft = '10px';
        deleteButton.addEventListener('click', () => {
            deleteCategory(index);
        });

        // Append the delete button to the list item
        listItem.appendChild(deleteButton);

        // Append the list item to the ul
        categoryList.appendChild(listItem);
    });
}


function deleteCategory(index) {
    // Fetch categories from local storage
    const categories = JSON.parse(localStorage.getItem(`user_${userId}_tags`)) || [];

    // Remove the category at the specified index
    categories.splice(index, 1);

    // Save the updated categories back to local storage
    localStorage.setItem(`user_${userId}_tags`, JSON.stringify(categories));

    fetchCategoriesFromLocalStorage();
}

fetchCategoriesFromLocalStorage();