document.addEventListener('DOMContentLoaded', () => {
    const dishesList = document.getElementById('dishes-list');
    const menuList = document.getElementById('menu-list');
    const caloriesInfo = document.getElementById('calories-info');
    const proteinsInfo = document.getElementById('proteins-info');
    const fatsInfo = document.getElementById('fats-info');
    const carbsInfo = document.getElementById('carbs-info');
    const dishesAmount = document.getElementById('dishes-amount')
    const shopList = document.getElementById('shop-list')
    const caloriesMax = document.getElementById('calories-max')
    const proteinsMax = document.getElementById('proteins-max')
    const fatsMax = document.getElementById('fats-max')
    const carbsMax = document.getElementById('carbs-max')
    const caloriesDiff = document.getElementById('calories-diff')
    const proteinsDiff = document.getElementById('proteins-diff')
    const fatsDiff = document.getElementById('fats-diff')
    const carbsDiff = document.getElementById('carbs-diff')

    // Пример данных о блюдах
    dishes = [];
    products = [];
    // надо загрузить список блюд из REST API
    fetch('http://127.0.0.1:3000/dishes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);
            counter = 4;
            data.dishes.forEach(dish => {
                dishes.push({ id: counter, name: dish, calories: 40 });
                counter++;
            });
            console.log(dishes);

            dishes.forEach(dish => {
                const li = document.createElement('li');
                li.textContent = dish.name;
                li.dataset.id = dish.id;
                li.dataset.calories = dish.calories;
                dishesList.appendChild(li);
            });
        })
        .catch(error => {
            // Handling any errors that occurred during the fetch
            console.error('There has been a problem with your fetch operation:', error);
          });


    // Добавление блюд в список блюд
    

    // Инициализация SortableJS для меню
    new Sortable(menuList, {
        group: {
            name: 'shared',
            pull: true,
            put: true
        },
        animation: 150,
        onAdd: (evt) => {
            updateMenu();
        },
        onRemove: () => {
            updateMenu();
        }
    });

    // Инициализация SortableJS для списка блюд
    new Sortable(dishesList, {
        group: {
            name: 'shared',
            pull: true,
            put: true
        },
        animation: 150,
        onRemove: (evt) => {
            const item = evt.item;
            const clone = item.cloneNode(true);
            dishesList.appendChild(clone);
            // sort dishesList content
            const sortedItems = Array.from(dishesList.children).sort((a, b) => {
                const aId = parseInt(a.dataset.id);
                const bId = parseInt(b.dataset.id);
                return aId - bId;
            });
            dishesList.innerHTML = '';
            sortedItems.forEach(item => dishesList.appendChild(item));
            
        }
    });

    // Функция для обновления меню и отправки данных на сервер
    async function updateMenu() {
        const menuItems = Array.from(menuList.children).map(item => ({
            id: parseInt(item.dataset.id),
            calories: parseInt(item.dataset.calories),
            name: item.textContent
        }));

        try {
            const response = await fetch('http://127.0.0.1:3000/calc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(menuItems)
                // {'Proteins': 6.925, 'Fats': 18.0, 'Carbs': 48.915, 'Calories': 385.36, 'Weight': 445}
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            caloriesInfo.textContent = `${parseInt(data.Calories)}`;
            proteinsInfo.textContent = `${parseInt(data.Proteins)}`;
            fatsInfo.textContent = `${parseInt(data.Fats)}`;
            carbsInfo.textContent = `${parseInt(data.Carbs)}`;
            caloriesMaxI = 11500;
            proteinsMaxI = 862.5;
            fatsMaxI = 460.0;
            carbsMaxI = 977.5;
            caloriesMax.textContent = caloriesMaxI;
            proteinsMax.textContent = proteinsMaxI;
            fatsMax.textContent = fatsMaxI;
            carbsMax.textContent = carbsMaxI;
            caloriesDiff.textContent = caloriesMaxI - parseInt(data.Calories);
            proteinsDiff.textContent = proteinsMaxI - parseInt(data.Proteins);
            fatsDiff.textContent = fatsMaxI - parseInt(data.Fats);
            carbsDiff.textContent = carbsMaxI - parseInt(data.Carbs);


            dishesAmount.textContent = `${data.DishesAmount}`;



            tableBody = document.querySelector('#productTable tbody');
            tableBody.innerHTML = '';
            var i = 0;
            for (var key in data.shoplist) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${i}</td>
                    <td>${key}</td>
                    <td>${data.shoplist[key]}</td>
                `;
                tableBody.appendChild(row);
                i++;
            }

        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
});

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
