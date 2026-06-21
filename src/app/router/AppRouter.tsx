import { createBrowserRouter, RouterProvider } from "react-router-dom";
import  MainLayout  from "../../layouts/MainLayout";
import  HomePage  from "../../pages/HomePage";
import  ProductsPage  from "../../pages/ProductsPage";
import  LoginPage  from "../../pages/LoginPage";
import ProductDetailPage from "../../pages/ProductDetailPage";
import CreateProductPage from "../../pages/CreateProductPage";
import ProtectedRoute from "../../shared/routes/ProtectedRoute";
import RegisterPage from "../../pages/RegisterPage";
import CartPage from "../../pages/CartPage";
import CheckoutPage from "../../pages/CheckoutPage";
import CheckoutReturnPage from "../../pages/CheckoutReturnPage";
import ProfilePage from "../../pages/ProfilePage";
import MyOrdersPage from "../../pages/MyOrdersPage";
import AdminLayout from "../../layouts/AdminLayout";
import AdminDashboardPage from "../../pages/admin/AdminDashboardPage";
import AdminProductsPage from "../../pages/admin/AdminProductsPage";
import AdminCategoriesPage from "../../pages/admin/AdminCategoriesPage";
import AdminCategorySuggestionsPage from "../../pages/admin/AdminCategoriesSuggestions";
import AdminUsersPage from "../../pages/admin/AdminUsersPage";
import AdminOrdersPage from "../../pages/admin/AdminOrdersPage";
import AdminRoute from "../../shared/routes/AdminRoute";
import AdminCreateCategoryPage from "../../pages/admin/AdminCreateCategoriesPage";
import AdminSubCategoriesAttributesPage from "../../pages/admin/AdminSubCategoriesAttributesPage";
import AdminPlansPage from "../../pages/admin/AdminPlansPage";
import AdminWithdrawalsPage from "../../pages/admin/AdminWithdrawalsPage";
const router = createBrowserRouter([
    {
        path : "/",
        element : <MainLayout/>,
        children:[
            {
                index : true, 
                element : <HomePage />
            }, 
            {
                path : "products", 
                element : <ProductsPage/>
            }, 
            {
                path : "login", 
                element : <LoginPage/> 
            }, 
            {
                path : "products/:id", 
                element : <ProductDetailPage/>
            }, 
            {
                path : "products/create", 
                element : (
                    <ProtectedRoute>
                        <CreateProductPage />
                    </ProtectedRoute>
                )
            }, 
            {
                path : "register", 
                element : <RegisterPage/>
            }, 
            {
                path : "cart", 
                element : (
                    <ProtectedRoute>
                        <CartPage/>
                    </ProtectedRoute>
                )
            }, 
            {
                path : "checkout",
                element : (
                    <ProtectedRoute>
                        <CheckoutPage/>
                    </ProtectedRoute>
                )
            },
            {
                path : "checkout/success",
                element : (
                    <ProtectedRoute>
                        <CheckoutReturnPage status="success"/>
                    </ProtectedRoute>
                )
            },
            {
                path : "checkout/failure",
                element : (
                    <ProtectedRoute>
                        <CheckoutReturnPage status="failure"/>
                    </ProtectedRoute>
                )
            },
            {
                path : "checkout/pending",
                element : (
                    <ProtectedRoute>
                        <CheckoutReturnPage status="pending"/>
                    </ProtectedRoute>
                )
            },
            {
                path : "profile",
                element : (
                    <ProtectedRoute>
                        <ProfilePage/>
                    </ProtectedRoute>
                )
            },
            {
                path : "profile/orders",
                element : (
                    <ProtectedRoute>
                        <MyOrdersPage/>
                    </ProtectedRoute>
                )
            },
        ], 
    }, 
    {
        path : "/admin",
        element : (
            <AdminRoute>
                <AdminLayout/>
            </AdminRoute>
        ),
        children: [
            {
            index: true,
            element: <AdminDashboardPage />,
            },
            {
            path: "products",
            element: <AdminProductsPage />,
            },
            {
            path: "categories",
            element: <AdminCategoriesPage />,
            },
            {
            path: "subcategories-attributes",
            element: <AdminSubCategoriesAttributesPage />,
            },
            {
            path: "category-suggestions",
            element: <AdminCategorySuggestionsPage />,
            },
            {
            path: "users",
            element: <AdminUsersPage />,
            },
            {
            path: "orders",
            element: <AdminOrdersPage />,
            },
            {
            path: "withdrawals",
            element: <AdminWithdrawalsPage />,
            },
            {
            path: "plans",
            element: <AdminPlansPage />,
            },
            {
                path : "categories/create", 
                element : <AdminCreateCategoryPage/>
            }
        ],
    }
])

export function AppRouter() {
    return <RouterProvider router={router}/>
}
