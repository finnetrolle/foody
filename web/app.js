document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});

class App {
    constructor() {
        this.dishesList = document.getElementById('dishes-list');
        this.menuList = document.getElementById('menu-list');
        this.caloriesInfo = document.getElementById('calories-info');
        this.proteinsInfo = document.getElementById('proteins-info');
        this.fatsInfo = document.getElementById('fats-info');
        this.carbsInfo = document.getElementById('carbs-info');
        this.dishesAmount = document.getElementById('dishes-amount');
        this.shopList = document.getElementById('shop-list');
        this.caloriesMax = document.getElementById('calories-max');
        this.proteinsMax = document.getElementById('proteins-max');
        this.fatsMax = document.getElementById('fats-max');
        this.carbsMax = document.getElementById('carbs-max');
        this.caloriesDiff = document.getElementById('calories-diff');
        this.proteinsDiff = document.getElementById('proteins-diff');
        this.fatsDiff = document.getElementById('fats-diff');
        this.carbsDiff = document.getElementById('carbs-diff');

        this.dishesUri = '/dishes';
        this.calcUri = '/calc';
        this.requiredCpfcUri = '/calcRequiredCpfc';

        this.state = {
            dishes: [],
            products: [],
            caloriesMaxValue: 0,
            proteinsMaxValue: 0,
            fatsMaxValue: 0,
            carbsMaxValue: 0,
            dishCounts: {}
        };
    }

    async init() {
        try {
            await Promise.all([this.loadDishesFromServer(), this.loadRequiredCpfcFromServer()]);
            this.initializeSortable();
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    initializeSortable() {
        new Sortable(this.menuList, {
            group: 'shared',
            animation: 150,
            onAdd: () => this.updateMenu(),
            onRemove: () => this.updateMenu()
        });

        new Sortable(this.dishesList, {
            group: 'shared',
            animation: 150
        });
    }
    
    async loadDishesFromServer() {
        try {
            const response = await fetch(this.dishesUri);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            
            this.state.dishes = data.dishes.map((dish, index) => ({
                id: index,
                name: dish,
                calories: 40
            }));

            // Устанавливаем количество каждого блюда в 1 по умолчанию
            this.state.dishCounts = this.state.dishes.reduce((acc, dish) => {
                acc[dish.id] = 1;
                return acc;
            }, {});

            this.renderDishesList(this.state.dishes);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async loadRequiredCpfcFromServer() {
        try {
            const response = await fetch(this.requiredCpfcUri, createPostRequest({}));
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();

            this.state.caloriesMaxValue = data.calories;
            this.state.proteinsMaxValue = data.proteins;
            this.state.fatsMaxValue = data.fats;
            this.state.carbsMaxValue = data.carbs;

            this.renderRequiredCpfc(this.state);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    async updateMenu() {
        try {
            const menuItems = this.parseMenuItems();
            if (menuItems.length === 0) return;

            const response = await fetch(this.calcUri, createPostRequest(menuItems));
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();

            this.renderCpfsTable(data);
            this.renderProductsTable(data);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    sortDishesList() {
        const sortedItems = Array.from(this.dishesList.children).sort((a, b) => 
            parseInt(a.dataset.id) - parseInt(b.dataset.id)
        );

        this.dishesList.innerHTML = '';
        sortedItems.forEach(item => this.dishesList.appendChild(item));
    }

    renderDishesList(dishes) {
        this.dishesList.innerHTML = '';
        dishes.forEach(dish => {
            const li = document.createElement('li');
            li.dataset.id = dish.id;
            li.dataset.calories = dish.calories;
    
            li.innerHTML = `
                <span class="dish-name">${dish.name}</span>
                <div class="quantity-controls">
                    <button data-action="decrease">-</button>
                    <span class="count">${this.state.dishCounts[dish.id]}</span>
                    <button data-action="increase">+</button>
                </div>
            `;
    
            li.querySelector('button[data-action="decrease"]').addEventListener('click', () => this.changeDishCount(dish.id, -1));
            li.querySelector('button[data-action="increase"]').addEventListener('click', () => this.changeDishCount(dish.id, 1));
    
            this.dishesList.appendChild(li);
        });
    }

    changeDishCount(dishId, change) {
        const currentCount = this.state.dishCounts[dishId];
        const newCount = Math.max(0, currentCount + change);
        if (newCount === 0) {
            // Если количество стало равно нулю, удаляем блюдо из списка
            delete this.state.dishCounts[dishId];
            this.renderDishesList(this.state.dishes.filter(d => d.id !== dishId));
        } else {
            this.state.dishCounts[dishId] = newCount;
            document.querySelector(`li[data-id="${dishId}"] .count`).textContent = newCount;
        }
    
        // Перерисовываем меню, если оно было изменено
        this.updateMenu();
    }
    

    renderRequiredCpfc(state) {
        this.caloriesMax.textContent = state.caloriesMaxValue.toFixed(2);
        this.proteinsMax.textContent = state.proteinsMaxValue.toFixed(2);
        this.fatsMax.textContent = state.fatsMaxValue.toFixed(2);
        this.carbsMax.textContent = state.carbsMaxValue.toFixed(2);
    }

    sortDishesList() {
        const sortedItems = Array.from(this.dishesList.children).sort((a, b) => 
            parseInt(a.dataset.id) - parseInt(b.dataset.id)
        );

        this.dishesList.innerHTML = '';
        sortedItems.forEach(item => this.dishesList.appendChild(item));
    }

    parseMenuItems() {
        return Array.from(this.menuList.children).map(item => ({
            id: parseInt(item.dataset.id),
            calories: parseInt(item.dataset.calories) * this.state.dishCounts[item.dataset.id],
            name: item.querySelector('span').textContent,
            count: this.state.dishCounts[item.dataset.id]
        }));
    }
    

    renderCpfsTable(data) {
        const { Calories, Proteins, Fats, Carbs, DishesAmount } = data;
        
        this.caloriesInfo.textContent = Calories.toFixed(2);
        this.proteinsInfo.textContent = Proteins.toFixed(2);
        this.fatsInfo.textContent = Fats.toFixed(2);
        this.carbsInfo.textContent = Carbs.toFixed(2);

        this.caloriesDiff.textContent = (this.state.caloriesMaxValue - Calories).toFixed(2);
        this.proteinsDiff.textContent = (this.state.proteinsMaxValue - Proteins).toFixed(2);
        this.fatsDiff.textContent = (this.state.fatsMaxValue - Fats).toFixed(2);
        this.carbsDiff.textContent = (this.state.carbsMaxValue - Carbs).toFixed(2);

        this.dishesAmount.textContent = DishesAmount;
    }

    renderProductsTable(data) {
        const tableBody = document.querySelector('#productTable tbody');
        tableBody.innerHTML = '';

        Object.entries(data.shoplist).forEach(([key, value], index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${key}</td>
                <td>${value}</td>
            `;
            tableBody.appendChild(row);
        });
    }

}

function createPostRequest(bodyData) {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    };
}

function sortTable(columnIndex) {
    const table = document.getElementById('productTable');
    let rows, switching, i, x, y, shouldSwitch;
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('TD')[columnIndex];
            y = rows[i + 1].getElementsByTagName('TD')[columnIndex];
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}