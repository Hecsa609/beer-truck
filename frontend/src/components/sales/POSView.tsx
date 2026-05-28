import { useState, useEffect } from 'react';
import {
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  Smartphone, ShoppingCart, Receipt, Check, RefreshCw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { productsAPI, salesAPI } from '../../api';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  unit: string;
  active: boolean;
  categories: { name: string; color: string } | null;
  inventory: any;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function POSView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const [showPayment, setShowPayment] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [saleResult, setSaleResult] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productsAPI.getAll()
      setProducts(data.products)
    } catch (err) {
      setError('Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'Cervezas Artesanales', label: 'Artesanal' },
    { id: 'Cervezas Comerciales', label: 'Comercial' },
    { id: 'Botanas', label: 'Botanas' },
    { id: 'Sin Alcohol', label: 'Sin Alcohol' },
    { id: 'Complementos', label: 'Complementos' },
  ]

  const getStock = (product: Product) => {
    const inv = Array.isArray(product.inventory) ? product.inventory[0] : product.inventory
    return inv?.stock_current || 0
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' ||
      p.categories?.name === selectedCategory
    return matchesSearch && matchesCategory && p.active && getStock(p) > 0
  })

  const addToCart = (product: Product) => {
    const stock = getStock(product)
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= stock) return prev
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit
      }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId)
    const stock = product ? getStock(product) : 999
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta
        if (newQty > stock) return item
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = subtotal * 0.16
  const total = subtotal + taxAmount

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
  }

  const handleCompleteSale = async () => {
    if (cart.length === 0) return
    setProcessing(true)
    setError('')
    try {
      const saleData = {
        items: cart.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price
        })),
        payment_method: paymentMethod,
        notes: 'Venta desde POS'
      }
      const result = await salesAPI.create(saleData)
      setSaleResult(result.sale)
      setSaleComplete(true)
      await loadProducts()
      setTimeout(() => {
        setCart([])
        setShowPayment(false)
        setSaleComplete(false)
        setSaleResult(null)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Error procesando la venta')
    } finally {
      setProcessing(false)
    }
  }

  if (saleComplete && saleResult) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Venta Completada!</h2>
          <p className="text-dark-300">Total: {formatCurrency(total)}</p>
          <p className="text-sm text-dark-400 mt-1">Folio: {saleResult.folio}</p>
          <p className="text-xs text-dark-500 mt-1">Método: {paymentMethod}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">

      {/* Products Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Punto de Venta</h1>
          <button
            onClick={loadProducts}
            className="p-2 rounded-xl bg-dark-700 text-dark-400 hover:text-white transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Buscar producto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-white/5 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-beer-500/30"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-beer-500/20 text-beer-400 border border-beer-500/30'
                  : 'bg-dark-800 text-dark-300 border border-white/5 hover:text-white hover:bg-dark-700'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-dark-400">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const stock = getStock(product)
                const inCart = cart.find(i => i.productId === product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="glass-card-hover rounded-xl p-4 text-left group relative"
                  >
                    {inCart && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-beer-500 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{inCart.quantity}</span>
                      </div>
                    )}
                    <div className="w-full h-16 rounded-lg bg-dark-700 flex items-center justify-center mb-3 group-hover:bg-beer-500/10 transition-colors">
                      <span className="text-2xl">🍺</span>
                    </div>
                    <h4 className="text-sm font-medium text-white truncate">{product.name}</h4>
                    <p className="text-xs text-dark-400 truncate mb-2">{product.sku}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-beer-400">{formatCurrency(product.price)}</span>
                      <span className="text-[10px] text-dark-500">{stock} disp.</span>
                    </div>
                  </button>
                )
              })}
              {!loading && filteredProducts.length === 0 && (
                <div className="col-span-4 text-center py-12 text-dark-400">
                  <p>No hay productos disponibles</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-96 glass-card rounded-2xl flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShoppingCart size={18} /> Carrito
            </h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-300">
                Limpiar
              </button>
            )}
          </div>
          <p className="text-xs text-dark-400 mt-0.5">{cart.length} artículos</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-400">
              <ShoppingCart size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Carrito vacío</p>
              <p className="text-xs">Agrega productos para comenzar</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center text-lg flex-shrink-0">
                  🍺
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.name}</p>
                  <p className="text-xs text-dark-400">{formatCurrency(item.price)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium text-white w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 rounded hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-300">Subtotal</span>
            <span className="text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-300">IVA (16%)</span>
            <span className="text-white">{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold pt-3 border-t border-white/5">
            <span className="text-white">Total</span>
            <span className="text-beer-400">{formatCurrency(total)}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {!showPayment ? (
            <button
              onClick={() => setShowPayment(true)}
              disabled={cart.length === 0}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                cart.length > 0
                  ? 'gradient-beer text-white hover:opacity-90 shadow-lg shadow-beer-500/20'
                  : 'bg-dark-700 text-dark-400 cursor-not-allowed'
              )}
            >
              <Receipt size={18} /> Cobrar {total > 0 ? formatCurrency(total) : ''}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-medium text-dark-300 uppercase">Método de Pago</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={16} /> },
                  { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={16} /> },
                  { id: 'transferencia', label: 'Transfer', icon: <Smartphone size={16} /> },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all',
                      paymentMethod === method.id
                        ? 'bg-beer-500/20 text-beer-400 border border-beer-500/30'
                        : 'bg-dark-800 text-dark-300 border border-white/5 hover:text-white'
                    )}
                  >
                    {method.icon}
                    {method.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPayment(false); setError('') }}
                  className="flex-1 py-3 bg-dark-700 rounded-xl text-sm text-dark-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={processing}
                  className="flex-1 py-3 gradient-beer rounded-xl text-sm font-medium text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} /> {processing ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}