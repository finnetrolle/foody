from sanic import Sanic, HTTPResponse
from sanic.response import json

from cpfc import CPFC
from product import Product
from dish import Dish
from ingridient import Ingridient
import pandas
import os


app = Sanic("Rorqual")
app.static('/', './web', index="index.html")

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
    
dishes_dict = dict()
for dish in dishes:
    dishes_dict[dish.name] = dish

    
@app.get("/dishes")
async def ping(request):
    result = dict()
    result["dishes"] = list()
    for dish in dishes:
        result["dishes"].append(dish.name)

    return json(result, headers = {"Access-Control-Allow-Origin": "*"})


@app.post("/calcReqiuredCpfc")
async def calc_required_cpfc(request):
    data = request.json
    #todo insert request parsing
    result = dict()
    result["proteins"] = 862.5
    result['fats'] = 460.0
    result['carbs'] = 977.5
    result['calories'] = 11500
    return json(result)

@app.post("/calc")
async def calc(request):
    #get data from request
    data = request.json
    menu = []
    for i in data:
        name = i['name']
        menu.append(dishes_dict[name])
        
    total_cpfc = CPFC(0,0,0)
    total_weight = 0
    for dish in menu:
        total_cpfc += dish.cpfc
        total_weight += dish.total_weight
    
    result = dict()
    result['Proteins'] = total_cpfc.protein
    result['Fats'] = total_cpfc.fat
    result['Carbs'] = total_cpfc.carbs
    result['Calories'] = total_cpfc.calories
    result['Weight'] = total_weight
    result['DishesAmount'] = len(menu)
    
    shop_list: dict[Product, int] = dict()
    for dish in menu:
        for i in dish.ingridients:
            if shop_list.get(i.product.name) is None:
                shop_list[i.product.name] = i.weight
            else:
                shop_list[i.product.name] += i.weight
                
    result['shoplist'] = shop_list
            
    print(result)
    return json(result)



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)