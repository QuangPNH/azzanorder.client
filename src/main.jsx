import React from 'react';
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import Homepage from "./components/Homepage";
import MenuPage from "./components/Menu";
import About from "./components/AboutUsPage";
import Feedback from "./components/Feedback";
import Voucher from "./components/VoucherScreen";
import Order from "./components/OrderTrackScreen";
import Profile from "./components/MemberProfile";
import Notification from "./components/NotificationPage";
import VoucherCart from './components/VoucherCart';
import { getCookie } from './components/Account/SignUpForm/Validate';

// Define your routes
const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "/",
                element: <Homepage />,
            },
            {
                path: "menu",
                element: <MenuPage />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "feedback",
                element: <Feedback />,
            },
            {
                path: "voucher",
                element: <Voucher />,
            },
            {
                path: "voucherCart",
                element: <VoucherCart />
            },
            {
                path: "order",
                element: <Order />,
            },
            {
                path: "profile",
                element: <Profile />,
            },
            {
                path: "notification",
                element: <Notification />,
            },
        ],
    },
]);

const rootElement = document.getElementById('root');
const searchParams = new URLSearchParams(window.location.search);
const tableqrParam = searchParams.get("tableqr");
const tableqrCookie = getCookie("tableqr");

// Check if both tableqrParam and tableqrCookie are missing
if (!tableqrParam || !tableqrCookie) {
    // Redirect to the provided link
    //window.location.href = "https://manager-owner-bhcrh9dvahbkgpfu.southeastasia-01.azurewebsites.net/";
} else {
    // Render the RouterProvider if tableqrParam or tableqrCookie is present
    ReactDOM.createRoot(rootElement).render(
        <RouterProvider router={router} />
    );
}
