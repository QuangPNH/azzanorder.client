import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Cart from './Cart';
import Popup from 'reactjs-popup';
import API_URLS from '../config/apiUrls';
import { getCookie } from './Account/SignUpForm/Validate';

const CartButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const tableqr = getCookie("tableqr");
    const handleCartButtonClick = () => {
        setIsOpen(true);
    };

    const handleClosePopup = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        if (tableqr) {
            const manaId = tableqr.split('/')[1];
            // Fetch the Cart color based on the tableqr value
            const fetchCartColor = async (manaId) => {
                try {
                    const url = manaId ? API_URLS.API + `Promotions/GetByDescription/cart/${manaId}` : API_URLS.API + `Promotions/GetByDescription/color`;
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        const newColor = data.description.split('/')[1];
                        document.documentElement.style.setProperty('--primary-color', newColor);
                    }
                } catch (error) {
                    console.error("Failed to fetch Cart color:", error);
                }
            };
            fetchCartColor(manaId);
        }
    }, [tableqr]);
    return (
        <div style={{ position: 'fixed', bottom: '80px', right: '20px', zIndex: '9999' }}>
            <button onClick={handleCartButtonClick} style={{ borderRadius: '100%', padding: '12px', backgroundColor: 'var(--primary-color)', cursor: 'pointer' }}>
                 <img src="https://file.garden/Z0M_TIZxgjUCRpfy/LogoAOS/shoppingCart.svg" style={{ width: '20px', height: '20px' }} />
            </button>
            <Popup open={isOpen} onClose={handleClosePopup} >
                <Cart/>
            </Popup>
        </div>
    );
};

export default CartButton;
