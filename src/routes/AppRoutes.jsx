import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Wrappers
import Header from '../components/layout/Header';
import Navbar from '../components/layout/Navbar';

// Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import RiderRoute from './RiderRoute';
import SuperAdminRoute from './SuperAdminRoute';

// Loader
import Loader from '../components/common/Loader';

// Public Pages (Lazy)
const Splash = lazy(() => import('../pages/Splash'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

// Customer Pages (Lazy)
const Home = lazy(() => import('../pages/Home/Home'));
const Categories = lazy(() => import('../pages/Categories/Categories'));
const Products = lazy(() => import('../pages/Products/Products'));
const ProductDetails = lazy(() => import('../pages/Products/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart/Cart'));
const Checkout = lazy(() => import('../pages/Checkout/Checkout'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const OrderDetails = lazy(() => import('../pages/Orders/OrderDetails'));
const OrderSuccess = lazy(() => import('../pages/Orders/OrderSuccess'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const AddressManagement = lazy(() => import('../pages/Profile/AddressManagement'));
const CloudKitchen = lazy(() => import('../pages/CloudKitchen/CloudKitchen'));
const CloudKitchenDishDetails = lazy(() => import('../pages/CloudKitchen/CloudKitchenDishDetails'));

// Admin Pages (Lazy)
const AdminDashboard = lazy(() => import('../admin/Dashboard'));
const AdminProducts = lazy(() => import('../admin/Products'));
const AdminOrders = lazy(() => import('../admin/Orders'));
const AdminCustomers = lazy(() => import('../admin/Customers'));
const AdminRiders = lazy(() => import('../admin/Riders'));
const AdminSettings = lazy(() => import('../admin/Settings'));
const AdminMedicines = lazy(() => import('../admin/Medicines'));
const AdminUserManagement = lazy(() => import('../admin/UserManagement'));
const AdminAnalytics = lazy(() => import('../admin/Analytics'));

// Rider Pages (Lazy)
const RiderDashboard = lazy(() => import('../rider/RiderDashboard'));
const RiderAssignedOrders = lazy(() => import('../rider/AssignedOrders'));
const RiderOrderTracking = lazy(() => import('../rider/OrderTracking'));
const RiderProfile = lazy(() => import('../rider/Profile'));

export const AppRoutes = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen relative pb-16">
      {/* Header element rendered on all pages except Splash and Auth */}
      <Header />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Suspense fallback={<Loader fullPage={true} />}>
          <Routes>
            {/* Public Routing */}
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public Customer Routes */}
            <Route path="/home" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cloud-kitchen" element={<CloudKitchen />} />
            <Route path="/cloud-kitchen/:id" element={<CloudKitchenDishDetails />} />

            {/* Protected Customer Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/addresses" element={<AddressManagement />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/riders" element={<AdminRiders />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/medicines" element={<AdminMedicines />} />

              {/* Super Admin Exclusive Routes */}
              <Route element={<SuperAdminRoute />}>
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
              </Route>
            </Route>

            {/* Protected Rider Routes */}
            <Route element={<RiderRoute />}>
              <Route path="/rider" element={<RiderDashboard />} />
              <Route path="/rider/orders" element={<RiderAssignedOrders />} />
              <Route path="/rider/track/:id" element={<RiderOrderTracking />} />
              <Route path="/rider/profile" element={<RiderProfile />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace={true} />} />
          </Routes>
        </Suspense>
      </div>

      {/* Bottom navbar element */}
      <Navbar />
    </div>
  );
};
export default AppRoutes;
