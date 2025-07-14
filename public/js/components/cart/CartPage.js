// CartPage Component - Main cart page using useCart hook
const CartPage = () => {
  // Ensure useCart hook is available
  if (!window.useCart) {
    console.error('useCart hook not available');
    return React.createElement('div', { className: 'cart-error' }, 
      React.createElement('p', null, 'Cart functionality not available. Please refresh the page.')
    );
  }

  const {
    cart,
    loading,
    error,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart
  } = window.useCart();

  // Load cart on component mount
  React.useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    await removeItem(productId);
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  if (loading) {
    return React.createElement('div', { className: 'cart-loading' }, 
      React.createElement('p', null, 'Loading cart...')
    );
  }

  if (error) {
    return React.createElement('div', { className: 'cart-error' }, 
      React.createElement('p', null, 'Error: ' + error),
      React.createElement('button', { 
        onClick: loadCart,
        className: 'btn btn-primary'
      }, 'Retry')
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return React.createElement('div', { className: 'cart-empty' },
      React.createElement('h2', null, 'Your Cart is Empty'),
      React.createElement('p', null, 'Add some items to your cart to get started.'),
      React.createElement('a', { 
        href: 'index.html',
        className: 'btn btn-primary'
      }, 'Continue Shopping')
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.product ? item.product.price : (item.price || 0);
    return sum + (price * item.quantity);
  }, 0);

  return React.createElement('div', { className: 'cart-page' },
    React.createElement('div', { className: 'cart-header' },
      React.createElement('h1', null, 'Shopping Cart'),
      React.createElement('button', {
        onClick: handleClearCart,
        className: 'btn btn-danger',
        disabled: loading
      }, 'Clear Cart')
    ),
    
    React.createElement('div', { className: 'cart-items' },
      cart.items.map(item => {
        const product = item.product || item;
        const productName = product.name || 'Unknown Product';
        const productPrice = product.price || item.price || 0;
        const productImage = product.imageUrl || product.image || 'images/products/placeholder.jpg';

        return React.createElement('div', { 
          key: item._id || item.productId,
          className: 'cart-item'
        },
          React.createElement('img', {
            src: productImage,
            alt: productName,
            className: 'cart-item-image'
          }),
          React.createElement('div', { className: 'cart-item-details' },
            React.createElement('h3', null, productName),
            React.createElement('p', { className: 'price' }, '$' + productPrice.toFixed(2))
          ),
          React.createElement('div', { className: 'cart-item-quantity' },
            React.createElement('button', {
              onClick: () => handleQuantityChange(item.productId, item.quantity - 1),
              disabled: loading || item.quantity <= 1,
              className: 'btn btn-sm'
            }, '-'),
            React.createElement('span', { className: 'quantity' }, item.quantity),
            React.createElement('button', {
              onClick: () => handleQuantityChange(item.productId, item.quantity + 1),
              disabled: loading,
              className: 'btn btn-sm'
            }, '+')
          ),
          React.createElement('div', { className: 'cart-item-total' },
            React.createElement('span', null, '$' + (productPrice * item.quantity).toFixed(2))
          ),
          React.createElement('button', {
            onClick: () => handleRemoveItem(item.productId),
            disabled: loading,
            className: 'btn btn-danger btn-sm'
          }, 'Remove')
        );
      })
    ),
    
    React.createElement('div', { className: 'cart-summary' },
      React.createElement('div', { className: 'cart-total' },
        React.createElement('h3', null, 'Total: $' + subtotal.toFixed(2))
      ),
      React.createElement('div', { className: 'cart-actions' },
        React.createElement('a', {
          href: 'index.html',
          className: 'btn btn-secondary'
        }, 'Continue Shopping'),
        React.createElement('button', {
          onClick: () => {
            alert('Checkout functionality not implemented yet');
          },
          disabled: loading,
          className: 'btn btn-primary'
        }, 'Proceed to Checkout')
      )
    )
  );
};

// Expose CartPage to global scope
console.log('Loading CartPage component...');
window.CartPage = CartPage;
console.log('CartPage loaded:', window.CartPage ? 'SUCCESS' : 'FAILED');
