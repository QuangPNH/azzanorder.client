import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { postOrder } from './PriceCalculator/PlaceOrderButton'
import { calculateTotal } from './Cart'
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import ShowMoreLink from './ShowMoreLink/ShowMoreLink';
import ProductCard from './ProductCard/ProductCard';
import Navbar from './HomeItem/Navbar';
import Frame from './HomeItem/Frame';
import { getCookie, setCookie } from './Account/SignUpForm/Validate';
import Cart from './Cart';
import { del } from 'framer-motion/client';
import Banner from './HomeItem/Banner';
import API_URLS from '../config/apiUrls';
import VoucherCart from './VoucherCart';

const Homepage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [recentMenuItems, setRecentMenuItems] = useState([]);
    const [showRecentlyOrdered, setShowRecentlyOrdered] = useState(false);
    const search = useLocation().search;
    const id = new URLSearchParams(search).get("tableqr");
    const status = new URLSearchParams(search).get("status");
    const hasRegisteredServiceWorker = useRef(false);
    const hasProcessedOrder = useRef(false);

    useEffect(() => {
        const memberInfo = getCookie('memberInfo');
        const memberId = memberInfo ? JSON.parse(memberInfo).memberId : null;

        const fetchData = async () => {
            
            if (id) {
                setCookie('tableqr', '', -1);
                setCookie('tableqr', id, 1);
                await fetchOrderExits(id.split('/')[0], id.split('/')[1]);
                generateNotiChange(id, 'Welcome to our restaurant');
                runFetchNotiChangeContinuously(id);
            }
            if (id.split('/')[1] != getCookie('tableqr').split('/')[1]) {
                setCookie('voucher', '', -1);
                setCookie('cartData', '', -1);
            }
            const empId = getCookie(`tableqr`);
            await fetchMenuItems(empId ? empId.split('/')[1] : null);
            if (memberId) {
                await fetchRecentMenuItems(memberId, empId ? empId.split('/')[1] : null);
                setShowRecentlyOrdered(true);
            }
        };

        if (status === "success" && !hasProcessedOrder.current) {
            hasProcessedOrder.current = true;
            const processOrder = async () => {
                const { total, totalDiscount } = await calculateTotal();
                await postOrder(total);
                alert("Your order has been queued");
            };
            processOrder();
        }

        if (status === "cancel") {
                alert("You cancel");
        }

        if (!hasRegisteredServiceWorker.current) {
            hasRegisteredServiceWorker.current = true;
            registerServiceWorker();
        }
        fetchData();

    }, [status]);


    const sendPostRequest = async (inputText, action) => {
        const url = API_URLS.NOTHUB + 'api/notifications/requests';
        const body = {
            text: inputText,
            action: action
        };
        const headers = {
            'Content-Type': 'application/json',
            'apikey': '0624d820-6616-430d-92a5-e68265a08593'
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            const data = await response.json();
            console.log('Response:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchNotiChange = async (tableQr) => {
        try {
            const response = await fetch(API_URLS.API + `NotiChanges/tableName/${tableQr}`);
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (error) {
            console.error('Error fetching notification change:', error);
        }
    };

    const updateNotiChange = async (notiChange) => {
        try {
            const response = await fetch(API_URLS.API + 'NotiChanges/' + notiChange.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notiChange),
            });
            if (!response.ok) {
                throw new Error('Error updating notification change');
            }
        } catch (error) {
            console.error('Error updating notification change:', error);
        }
    };
    const postStaffNotiChannel = async (tableQR, managerId, message) => {
        const staffNotiChannel = {
            tableQR: tableQR,
            managerId: managerId,
            message: message,
            dateAdded: new Date().toISOString(),
            isSent: false
        };
        try {
            const response = await fetch(API_URLS.API + 'StaffNotiChannels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffNotiChannel),
            });
            if (!response.ok) {
                throw new Error('Error posting staff notification channel');
            }
        } catch (error) {
            console.error('Error posting staff notification channel:', error);
        }
    };

    const generateNotiChange = async (tableName, message) => {
        const notiChangeCookie = getCookie('notiChange');
        if (notiChangeCookie) {
            console.log('NotiChange already exists in cookie:', notiChangeCookie);
            return;
        }
        const notiChange = {
            tableName: tableName,
            message: message,
            isSent: true,
            dateCreated: new Date().toISOString()
        };
        try {
            const response = await fetch(API_URLS.API + 'NotiChanges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notiChange),
            });
            if (!response.ok) {
                throw new Error('Error generating notification change');
            }
            // Add notiChange to cookie after successful response
            setCookie('notiChange', JSON.stringify(notiChange), 1);
        } catch (error) {
            console.error('Error generating notification change:', error);
        }
    };


    const runFetchNotiChangeContinuously = (tableQr) => {
        const fetchAndUpdateNotiChange = async () => {
            let secondRunData = await fetchNotiChange(tableQr);
            if (secondRunData && !secondRunData.isSent) {
                const message = secondRunData.message;
                generateNotification(message);
                secondRunData.isSent = true;
                await updateNotiChange(secondRunData);
            }
        };
        fetchAndUpdateNotiChange(); // Initial call
        setInterval(fetchAndUpdateNotiChange, 10000); // Subsequent calls every 60 seconds
    };

    const generateNotification = (message) => {
        if (Notification.permission === "granted") {
            navigator.serviceWorker.getRegistration().then(registration => {
                if (registration) {
                    registration.showNotification("Notification", { body: message });
                }
            });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    navigator.serviceWorker.getRegistration().then(registration => {
                        if (registration) {
                            registration.showNotification("Notification", { body: message });
                        }
                    });
                }
            });
        }
    };

    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            console.log('Service worker supported');
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        } else {
            console.log('Service worker not supported');
        }
    };

    window.addEventListener('load', () => {
        console.log('Window loaded');
    });

    const fetchMenuItems = async (manaId) => {
        try {
            const url = manaId ? API_URLS.API + `MenuItem/top4?id=${manaId}` : API_URLS.API + 'MenuItem/top4';
            const response = await fetch(url);
            const data = await response.json();
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchOrderExits = async (tableQr, manaId) => {
        try {
            const response = await fetch(API_URLS.API + `Order/GetOrderByTableQr/${tableQr}/${manaId}`);
            if (response.ok) {
                window.location.href = '/order';
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchRecentMenuItems = async (customerId, manaId) => {
        try {
            const url = manaId ? API_URLS.API + `MenuItem/RecentMenuItems/${customerId}?id=${manaId}` : API_URLS.API + `MenuItem/RecentMenuItems/${customerId}`;
            const response = await fetch(url);
            const data = await response.json();
            setRecentMenuItems(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    return (
        <>
            <Header />
            <div className="page-container">
                <Navbar />
                <ShowMoreLink title="LIMITED COMBO" />
                <Frame />
                <div>
                    {showRecentlyOrdered && recentMenuItems && Array.isArray(recentMenuItems) && (
                        <div>
                            <ShowMoreLink title="RECENTLY ORDERED" />
                            <div className='product-grid'>
                                {recentMenuItems?.map((menuItem) => (
                                    <ProductCard
                                        key={menuItem.menuItemId}
                                        id={menuItem.menuItemId}
                                        title={menuItem.itemName}
                                        price={menuItem.price}
                                        imageSrc={menuItem.imageBase64}
                                        cate={menuItem.category}
                                        desc={menuItem.description}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <ShowMoreLink title="HOT ITEMS" />
                    <div className='product-grid'>
                        {menuItems?.map((menuItem) => (
                            <ProductCard
                                key={menuItem.menuItemId}
                                id={menuItem.menuItemId}
                                title={menuItem.itemName}
                                price={menuItem.price}
                                imageSrc={menuItem.imageBase64}
                                cate={menuItem.category}
                                desc={menuItem.description}
                            />
                        ))}
                    </div>
                    <Banner />
                </div>
                <style jsx>{`  
               .page-container {  
                   display: flex;  
                   flex-direction: column;  
                   align-items: center;  
                   width: 100%;  
                   box-sizing: border-box;  
               }  

               .product-grid {  
                   display: flex;  
                   flex-wrap: wrap;  
                   justify-content: center; /* Center-align the grid */  
                   gap: 20px;  
                   width: 100%;  
                   max-width: 1200px; /* Set a max-width to avoid stretching */  
               }  
               .product-grid > * {  
     flex: 1 1 calc(50% - 20px); /* Ensures 2 items per row */  
     box-sizing: border-box;  
   }  
               `}
                </style>

            </div>
            <Footer />
        </>
    );
};

function deleteCookie(name) {
    setCookie(name, '', -1); // Call setCookie with negative days to delete  
}

export default Homepage;
