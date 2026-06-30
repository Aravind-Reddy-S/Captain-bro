import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { RiderProvider } from './context/RiderContext';
import { AdminProvider } from './context/AdminContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RiderProvider>
          <AdminProvider>
            <CartProvider>
              <OrderProvider>
                <AppRoutes />
              </OrderProvider>
            </CartProvider>
          </AdminProvider>
        </RiderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
