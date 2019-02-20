import m from 'mithril'
import Stream from 'mithril/stream'
import {products} from './products'

function findProduct (name) {
    return products.find(function (p) {
        return p.name === name
    })
}

function loadProductProps (name, amount) {
    var product = findProduct(name)
    if (!product) return
    product = Object.assign({}, product)
    product.amount = Stream(amount || 100)
    product.key = Math.ceil(1e9 * Math.random())
    return product
}

var selectedProducts = []

function loadSelectedProducts () {
    var savedProducts = JSON.parse(localStorage.getItem('selectedProducts') || "[]")
    for (var i=0; i<savedProducts.length; i+=1) {
        var p = savedProducts[i]
        var product = loadProductProps(p.name, p.amount)
        if (!product) continue
        selectedProducts.push(product)
    }
}

function removeSelectedProduct(key) {
    var ind = selectedProducts.findIndex(function (p) {
        return p.key === key
    })
    if (ind >= 0) {
        selectedProducts.splice(ind, 1)
        saveSelectedProducts()
    }
}

function saveSelectedProducts () {
    var savedProducts = []
    selectedProducts.map(function (p) {
        savedProducts.push({name: p.name, amount: p.amount()})
    })
    localStorage.setItem('selectedProducts', JSON.stringify(savedProducts))
}

var currentProduct = Stream(null)

var ProductSelector = {
    view: function (vnode) {
        return [
            m('input#productInput[type=text][list=product-list][placeholder="Выберите продукт..."]', {
                onchange: m.withAttr('value', currentProduct),
                value: currentProduct()
            }),
            m('button#addProductBtn', {
                title: 'Добавить продукт',
                disabled: !findProduct(currentProduct()),
                onclick: function () {
                    if (!currentProduct()) return
                    var product = loadProductProps(currentProduct())
                    if (!product) return
                    currentProduct(null)
                    selectedProducts.push(product)
                    saveSelectedProducts()
                }
            }, '+'),
            m('datalist#product-list', products.map(function (p) {
                return m('option', p.name)
            }))
        ]
    }
}

var ProductTable = {
    view: function (vnode) {
        var rows = [m('tr', {key: 0}, [
            m('th'),
            m('th'), 
            m('th', 'Вес'),
            m('th', 'Ккал'),
            m('th', 'Бел'),
            m('th', 'Жир'),
            m('th', 'Угл'),
            m('th', 'ГИ'),
        ])]
        var summary = {kcal: 0, prot: 0, fat: 0, carb: 0, weight: 0}
        selectedProducts.map(function (p) {
            var k = p.amount() / 100
            rows.push(m('tr', {key: p.key}, [
                m('td', m('button', {
                    title: 'Убрать ' + p.name,
                    onclick: function () {
                        removeSelectedProduct(p.key)
                    }
                }, 'x')),
                m('td.name', p.name),
                m('td', m('input.amountInput[type=number]', {
                    min: 0,
                    oninput: function () {
                        p.amount(this.value)
                        saveSelectedProducts()
                    },
                    value: p.amount()
                })),
                m('td.num', (k*p.kcal).toFixed(1)),
                m('td.num', (k*p.prot).toFixed(1)),
                m('td.num', (k*p.fat).toFixed(1)),
                m('td.num', (k*p.carb).toFixed(1)),
                m('td.gi', p.gi || '-'),
            ]))
            summary.weight += k
            summary.kcal += k*p.kcal
            summary.prot += k*p.prot
            summary.fat += k*p.fat
            summary.carb += k*p.carb
        })
        rows.push(m('tr', {key: -2}, [
            m('th'),
            m('th.name', 'Всего:'),
            m('th', (100*summary.weight).toFixed()), 
            m('th.num', summary.kcal.toFixed(1)),
            m('th.num', summary.prot.toFixed(1)),
            m('th.num', summary.fat.toFixed(1)),
            m('th.num', summary.carb.toFixed(1)),
            m('th'),
        ]))
        summary.weight && rows.push(m('tr', {key: -1}, [
            m('th'),
            m('th.name', 'В 100гр:'),
            m('th'), 
            m('th.num', (summary.kcal / summary.weight).toFixed(1)),
            m('th.num', (summary.prot / summary.weight).toFixed(1)),
            m('th.num', (summary.fat  / summary.weight).toFixed(1)),
            m('th.num', (summary.carb / summary.weight).toFixed(1)),
            m('th'),
        ]))
        return m('table#productTable', rows)
    }
}

loadSelectedProducts()

m.mount(document.body, {view: function () {
    return [m(ProductSelector), m(ProductTable)]
}})
