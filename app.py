from flask import Flask, render_template, request, jsonify
import xml.etree.ElementTree as ET

app = Flask(__name__)

inventory_file = 'inventory.xml'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/inventory', methods=['GET', 'POST'])
def manage_inventory():
    tree = ET.parse(inventory_file)
    root = tree.getroot()

    if request.method == 'GET':
        inventory_data = []
        for product in root.findall('product'):
            inventory_data.append({
                'id': product.get('id'),
                'name': product.find('name').text,
                'category': product.find('category').text,
                'stock': product.find('stock').text,
                'price': product.find('price').text
            })
        return jsonify({'inventory_data': inventory_data})  

    elif request.method == 'POST':
        new_product_name = request.json.get('name')
    
        # Check if a product with the same name already exists
        for product in root.findall('product'):
            if product.find('name').text == new_product_name:
                return jsonify({'message': 'Product with the same name already exists'}), 400
        
        # If the product name is unique, proceed to add it
        new_product = ET.Element('product')
        new_product.set('id', str(len(root.findall('product')) + 1))
        name = ET.Element('name')
        name.text = new_product_name
        category = ET.Element('category')
        category.text = request.json['category']
        stock = ET.Element('stock')
        stock.text = request.json['stock']
        price = ET.Element('price')
        price.text = request.json['price']
        new_product.append(name)
        new_product.append(category)
        new_product.append(stock)
        new_product.append(price)
        root.append(new_product)
        tree.write(inventory_file)
        return jsonify({'message': 'Product added successfully'}), 201

@app.route('/inventory/<int:product_id>', methods=['GET', 'PATCH', 'DELETE'])
def manage_product(product_id):
    tree = ET.parse(inventory_file)
    root = tree.getroot()
    product = root.find(f".//product[@id='{product_id}']")
    if product is None:
        return jsonify({'message': 'Product not found'}, 404)

    if request.method == 'GET':
        product_data = {
            'id': product.get('id'),
            'name': product.find('name').text,
            'stock': product.find('stock').text,
            'price': product.find('price').text
        }
        return jsonify({'product': product_data})

    elif request.method == 'PATCH':
        if 'name' in request.json:
            product.find('name').text = request.json['name']
        if 'stock' in request.json:
            product.find('category').text = request.json['category']
        if 'stock' in request.json:
            product.find('stock').text = request.json['stock']
        if 'price' in request.json:
            product.find('price').text = request.json['price']
        tree.write(inventory_file)
        return jsonify({'message': 'Product updated successfully'})

    elif request.method == 'DELETE':
        root.remove(product)
        tree.write(inventory_file)
        return jsonify({'message': 'Product deleted successfully'})

@app.route('/inventory/search', methods=['GET'])
def search_inventory():
    category = request.args.get('category').lower()
    search_term = request.args.get('search_term')

    tree = ET.parse(inventory_file)
    root = tree.getroot()

    filtered_products = []

    for product in root.findall("product"):
        product_category = product.find('category').text.lower()
        product_name = product.find('name').text.lower()

        if category == 'all' or product_category == category:
            if search_term.lower() in product_name:
                filtered_products.append({
                    'id': product.get('id'),
                    'name': product.find('name').text,
                    'category': product.find('category').text,
                    'stock': product.find('stock').text,
                    'price': product.find('price').text
                })

    return jsonify({'inventory_data': filtered_products})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)