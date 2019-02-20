import json

products = []

with open('products.txt') as f:
    for l in f:
        l = l.strip()
        if not l or l.startswith('/'):
            continue
        parts = l.split('\t')
        prot, fat, carb, kcal, gi = parts[-5:]
        prot = float(prot)
        fat = float(fat)
        carb = float(carb)
        kcal = float(kcal)
        gi = float(gi.strip()) if gi.strip() != '-' else None
        name = parts[0].strip()
        product = {
            'name': name,
            'prot': prot,
            'fat': fat,
            'carb': carb,
            'kcal': kcal,
        }
        if gi:
            product['gi'] = gi
        products.append(product)

products.sort(key=lambda x: x['name'])

with open('js/products.js', 'w') as f:
    f.write('module.exports = { products: ')
    f.write(json.dumps(products))
    f.write('}')
