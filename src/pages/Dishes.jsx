import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import AddProductModal from '../components/AddProductModal'
import AddDishModal from '../components/AddDishModal'
import AddToDiaryModal from '../components/AddToDiaryModal'

function Dishes({ session }) {
  const [tab, setTab] = useState('products') // 'products' | 'dishes'
  const [products, setProducts] = useState([])
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddDish, setShowAddDish] = useState(false)
  const [diaryTarget, setDiaryTarget] = useState(null)

  useEffect(() => {
    loadProducts()
    loadDishes()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setProducts(data)
    setLoading(false)
  }

  const loadDishes = async () => {
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setDishes(data)
  }

  const deleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  const deleteDish = async (id) => {
    await supabase.from('dishes').delete().eq('id', id)
    loadDishes()
  }

  const openDiaryForProduct = (product) => {
    setDiaryTarget({
      name: product.name,
      kcalPer100g: product.kcal_per_100g,
      composition: null,
      source: 'product',
    })
  }

  const openDiaryForDish = (dish) => {
    setDiaryTarget({
      name: dish.name,
      kcalPer100g: dish.kcal_per_100g,
      composition: dish.composition,
      source: 'dish',
    })
  }

  const tabStyle = (isActive) => ({
    padding: '10px 18px',
    borderRadius: '6px',
    border: 'none',
    background: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? '#fff' : 'var(--accent)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '0.85rem',
    cursor: 'pointer',
  })

  return (
    <div className="card">
      <h1>Библиотека еды</h1>
      <p className="sub" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '20px' }}>
        Ваши сохраненные продукты и блюда
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button style={tabStyle(tab === 'products')} onClick={() => setTab('products')}>
          Продукты
        </button>
        <button style={tabStyle(tab === 'dishes')} onClick={() => setTab('dishes')}>
          Блюда
        </button>
      </div>

      <p className="sub" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '20px' }}>
        {tab === 'products'
          ? 'Одиночные продукты или готовые блюда'
          : 'Сложные блюда из нескольких ингридиентов'}
      </p>

      {tab === 'products' && (
        <>
          <button className="add-btn" onClick={() => setShowAddProduct(true)}>
            + Добавить
          </button>

          {products.length === 0 ? (
            <p className="sub" style={{ marginTop: '16px' }}>Пока ничего не добавлено.</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {products.map(product => (
                <div
                  key={product.id}
                  className="row"
                  style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 14px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '0.85rem' }}>
                    <strong>{product.name}</strong> — {product.kcal_per_100g} ккал/100г
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="remove-btn"
                      title="Добавить в дневник"
                      onClick={() => openDiaryForProduct(product)}
                      style={{ color: '#a89f8f' }}
                    >
                      ✓
                    </button>
                    <button
                      className="remove-btn"
                      title="Удалить"
                      onClick={() => deleteProduct(product.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'dishes' && (
        <>
          <button className="add-btn" onClick={() => setShowAddDish(true)}>
            + Добавить
          </button>

          {dishes.length === 0 ? (
            <p className="sub" style={{ marginTop: '16px' }}>Пока ничего не добавлено.</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {dishes.map(dish => (
                <div
                  key={dish.id}
                  className="row"
                  style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 14px', marginBottom: '8px', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '0.85rem' }}>
                    <strong>{dish.name}</strong> — {dish.kcal_per_100g.toFixed(1)} ккал/100г
                    <div style={{ color: '#6b7268', fontSize: '0.78rem', marginTop: '6px' }}>
                      Выход: {dish.output_weight} г
                      {dish.composition && dish.composition.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          {dish.composition.map((item, i) => (
                            <div key={i}>{item.ingredient}: {item.weight} г, {item.kcal} ккал</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="remove-btn"
                      title="Добавить в дневник"
                      onClick={() => openDiaryForDish(dish)}
                      style={{ color: '#a89f8f' }}
                    >
                      ✓
                    </button>
                    <button
                      className="remove-btn"
                      title="Удалить"
                      onClick={() => deleteDish(dish.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showAddProduct && (
        <AddProductModal
          session={session}
          onClose={() => setShowAddProduct(false)}
          onSaved={loadProducts}
        />
      )}

      {showAddDish && (
        <AddDishModal
          session={session}
          onClose={() => setShowAddDish(false)}
          onSaved={loadDishes}
        />
      )}

      {diaryTarget && (
        <AddToDiaryModal
          item={diaryTarget}
          session={session}
          onClose={() => setDiaryTarget(null)}
          onSaved={() => {}}
        />
      )}
    </div>
  )
}

export default Dishes
