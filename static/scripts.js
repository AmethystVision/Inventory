function displayInventory() {
    fetch('/inventory')
        .then(response => response.json())
        .then(data => {
            const inventoryList = document.getElementById('inventory-list');
            inventoryList.innerHTML = '';

            data.inventory_data.forEach(product => {
                const row = document.createElement('tr');
                const formattedPrice = product.price ? product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'N/A';
                // Use the conditional operator (ternary) to handle null or undefined product.price
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.stock}</td>
                    <td>&#8369;${formattedPrice}</td>
                    <td>
                        <button class="edit-button" onclick="editProduct(${product.id})">Edit</button>
                        <button class="delete-button" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;
                inventoryList.appendChild(row);
            });
        });
}

// Function to add a new product
function add() {
    document.getElementById('add').style.display = 'block';
}

function addProduct() {
    const name = document.getElementById('name').value;
    const stock = document.getElementById('stock').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;

    document.getElementById('add').style.display = 'none';

    fetch('/inventory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, category,stock, price }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            displayInventory();
        });

    
}

function editProduct(productId) {
    selectedProductId = productId;
    fetch(`/inventory/${productId}`)
        .then(response => response.json())
        .then(data => {
            const product = data.product;
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-category').value = product.category;
            document.getElementById('edit-stock').value = product.stock;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-product').style.display = 'block';
        });
}


function updateProduct(selectedProductId) {
    productId = selectedProductId;
    const updatedName = document.getElementById('edit-name').value;
    const updatedCategory = document.getElementById('edit-category').value;
    const updatedStock = document.getElementById('edit-stock').value;
    const updatedPrice = document.getElementById('edit-price').value;

    // Send the updated data to the server using a PATCH request
    fetch(`/inventory/${productId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: updatedName,
            category: updatedCategory,
            stock: updatedStock,
            price: updatedPrice,
        }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);

            // Hide the edit form after updating
            document.getElementById('edit-product').style.display = 'none';

            // Refresh the inventory list
            displayInventory();
        });
}

// Function to delete a product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        fetch(`/inventory/${productId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                displayInventory();
            });
    }
}

// Function to filter products based on category and search term
function searchProducts() {
    const category = document.getElementById('filterCategory').selectedOptions[0].value;
    const search_term = document.getElementById('search').value;

    fetch(`/inventory/search?category=${category}&search_term=${search_term}`)
        .then(response => response.json())
        .then(data => {
            const inventoryList = document.getElementById('inventory-list');
            inventoryList.innerHTML = '';

            data.inventory_data.forEach(product => {
                const row = document.createElement('tr');
                const formattedPrice = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.stock}</td>
                    <td>&#8369;${formattedPrice}</td>
                    <td>
                        <button class="edit-button" onclick="editProduct(${product.id})">Edit</button>
                        <button class="delete-button" onclick="deleteProduct(${product.id})">Delete</button>
                    </td>
                `;
                inventoryList.appendChild(row);
            });
        });
}

// Add an event listener to the search button
document.getElementById('search-button').addEventListener('click', searchProducts);

displayInventory();