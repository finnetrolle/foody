from cpfc import CPFC
from product import Product
from dish import Dish
from ingridient import Ingridient
import pandas
import os
import random

# create sanic app here




def load_dish(dish_name: str, filename: str, products: dict[str, Product]) -> Dish:
    data = pandas.read_csv(filename)
    ingridients: list[Ingridient] = list()
    
    for index, v in data.iterrows():
        name = v['Продукт']
        prod = products[name]
        i = Ingridient(prod, v['Вес'])
        ingridients.append(i)

    return Dish(dish_name, ingridients)



food = pandas.read_csv('foods.csv')

products: dict[str, Product] = dict()
for index, p in food.iterrows():
    products[p['Продукт']] = Product(p['Продукт'], CPFC(float(p['Б']), float(p['Ж']), float(p['У'])))


dishes = list()
dir = os.path.join(os.getcwd(), 'dishes')
for filename in os.listdir(dir):
    dish = load_dish(os.path.splitext(filename)[0], os.path.join(dir, filename), products)
    dishes.append(dish)

# for i in dishes:
#     print(i)

TARGET_CPFC = CPFC(862.5, 460.0, 977.5)
print(TARGET_CPFC.calories)
TARGET_DISHES = 30
MAX_ONE_DISH = 10
MIN_ONE_DISH = 4

# randomly define 25 dishes
# menu: list[Dish] = [dishes[random.randint(0,len(dishes)-1)] for _ in range(25)]
menu: list[Dish] = list()

# fill menu list with TARGET_DISHES dish elements maximum, but each dish must be in list from MIN_ONE_DISH times to MAX_ONE_DISH times
while len(menu) < TARGET_DISHES:
    if TARGET_DISHES - len(menu) >= 4:
        dish = dishes[random.randint(0,len(dishes)-1)]
        if dish not in menu:
            for _ in range(MIN_ONE_DISH):
                menu.append(dish)
        else:
            if menu.count(dish) < MAX_ONE_DISH:
                menu.append(dish)
    else:
        dish = menu[random.randint(0,len(menu)-1)]
        if menu.count(dish) < MAX_ONE_DISH:
            menu.append(dish)

total_cpfc = CPFC(0,0,0)
total_weight = 0
for dish in menu:
    total_cpfc += dish.cpfc
    total_weight += dish.total_weight
    
#sort menu by dish name
menu.sort(key=lambda x: x.name)

for i in menu:
    print(i)

print(f'Total CPFC = {total_cpfc}')
print(f'Total weight = {total_weight}')

shop_list: dict[Product, int] = dict()
for dish in menu:
    for i in dish.ingridients:
        if shop_list.get(i.product) is None:
            shop_list[i.product] = i.weight
        else:
            shop_list[i.product] += i.weight

for k,v in shop_list.items():
    print(f'{k.name} - {v}')

    




