import React, { useEffect, useState } from "react";
import { getCookie, setCookie } from '../Account/SignUpForm/Validate';
import LogoutPage from '../Account/LogoutPage';
import { useLocation } from "react-router-dom";
import { table } from "framer-motion/client";
import API_URLS from "../../config/apiUrls";

async function AddPoint(memberId, amount) {
    const response = await fetch(API_URLS.API + `Member/UpdatePoints/memberId/point?memberId=${memberId}&point=${amount / 1000}`);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const response1 = await fetch(API_URLS.API + `MemberVouchers/memberId/voucherDetailId?memberId=${memberId}&voucherDetailId=${JSON.parse(getCookie('voucher')).voucherDetailId}`);
    if (!response1.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data1 = await response1.json();
    const response2 = await fetch(API_URLS.API + `MemberVouchers/Delete/${data1.memberVoucherId}`, {
        method: "DELETE",
    });
    if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    else{
        setCookie('voucher', '', -1);
    }
};

export async function postOrder(amount, isCash) {
    try {
        const cartDataString = getCookie("cartData");
        if (!cartDataString) {
            throw new Error("No item in cart");
        }
        const memberIn = getCookie('memberInfo');
        const cartData = JSON.parse(cartDataString);
        const orderDetails = cartData.map(item => {
            const { selectedIce, selectedSugar, selectedToppings } = item.options || {};
            const descriptionParts = [];

            if (selectedIce) {
                descriptionParts.push(`${selectedIce} Ice`);
            }
            if (selectedSugar) {
                descriptionParts.push(`${selectedSugar} Sugar`);
            }

            if (selectedToppings && selectedToppings.length > 0) {
                selectedToppings.forEach(topping => {
                    descriptionParts.push(topping.name);
                });
            }

            return {
                Quantity: item.quantity,
                MenuItemId: item.id,
                Description: descriptionParts.length > 0 ? descriptionParts.join(', ') : null,
            };
        });

        const cookieValue = getCookie('tableqr');
        const tableId = cookieValue
            ? parseInt(cookieValue.split('/')[2] ?? 0)
            : null;
        let order = {
            TableId: tableId,
            Cost: amount,
            OrderDetails: orderDetails,
            Status: false,
        };
        if (memberIn) {
            order.MemberId = JSON.parse(memberIn).memberId;
        }
        if (isCash) {
            order.Status = null;
        }
        const response = await fetch(API_URLS.API + "Order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(order),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Order created successfully:", data);

        sendNotification('Order successful', 'Your order has been placed successfully', '/images/logo192.png');
        if (isCash) {
            const tableQrParts = getCookie('tableqr').split('/');
            postStaffNotiChannel(tableQrParts[0], tableQrParts[1], "New Confirmed Order Paid With Cash");
            sendPostRequest("Confirm Order Paid With Cash", "Confirm");
        }
        else {
            const tableQrParts = getCookie('tableqr').split('/');
            postStaffNotiChannel(tableQrParts[0], tableQrParts[1], "New Confirmed Order Paid With Bank Transfer");
            sendPostRequest("Confirm Order Paid With Bank Transfer", "OrderSuccesses");
        }
        if (memberIn) {
            AddPoint(JSON.parse(memberIn).memberId, amount);

        }
        deleteCookie('cartData');
        return data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
}
const sendNotification = (title, body, icon) => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            if (Notification.permission === "granted") {
                registration.showNotification(title, {
                    body: body,
                    icon: icon
                });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        registration.showNotification(title, {
                            body: body,
                            icon: icon
                        });
                    }
                });
            }
        });
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
        console.log('Staff notification channel posted successfully');
    } catch (error) {
        console.error('Error posting staff notification channel:', error);
    }
};

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
const PlaceOrderButton = ({ amount, isTake, isCash }) => {
    const [qrDataURL, setQRDataURL] = useState(null);
    const [error, setError] = useState(null);
    
    const handlePlaceOrder = async () => {
        try {
            if (isCash) {
                await postOrder(amount, isCash);
                alert("Your order has queued, please find staff to confirm it.")
                window.location.href = "/";
            } else {

                const cartDataString = getCookie("cartData");
                const yeh = getCookie('tableqr') ? getCookie('tableqr').split('/')[1] : null;
                try {
                    const response = await fetch(API_URLS.API + `Owner/Manager/${yeh}`);
                    var owner = await response.json();
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }



                const bank = {
                    PAYOS_CLIENT_ID: owner.bank.payoS_CLIENT_ID,
                    PAYOS_API_KEY: owner.bank.payoS_API_KEY,
                    PAYOS_CHECKSUM_KEY: owner.bank.payoS_CHECKSUM_KEY,
                };
                //Set owner PayOs
                fetch(API_URLS.PAYOS+ "?tableqr=" + getCookie("tableqr") + "&Price=" + amount + "&Item=" + cartDataString + "&Message=Order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(bank)
                }).then(response => response.text()) // Expect a text response (the URL as a string)
                    .then(url => {
                        // Redirect to the URL returned by the server
                        window.location.href = url;
                    });
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {qrDataURL && !isCash ? (
                <img src={`data:image/png;base64,${qrDataURL}`} alt="QR Code" className="qr-image" style={{ width: '300px' }} />
            ) : (
                <button className="place-order" onClick={handlePlaceOrder}>
                    Place Order
                </button>
            )}
            <style jsx>{`
                .place-order {
                    border-radius: 10px;
                    background: var(--primary-color);
                    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
                    margin-top: 49px;
                    width: 100%;
                    color: var(--sds-color-text-brand-on-brand);
                    padding: 15px 70px;
                    font: var(--sds-typography-body-font-weight-regular)
                        var(--sds-typography-body-size-medium) / 1
                        var(--sds-typography-body-font-family);
                    border: 1px solid #bd3226;
                    cursor: pointer;
                }
                .qr-image {
                    width: 100%;
                    max-width: 100%;
                    height: auto;
                    margin-top: 49px;
                }
            `}</style>
        </div>
    );
};
const deleteCookie = () => {
    setCookie('cartData', '', -1); // Call setCookie with negative days to delete

};
export default PlaceOrderButton;
