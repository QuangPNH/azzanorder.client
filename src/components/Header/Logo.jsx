import React, { useState, useEffect } from 'react';
import { getCookie } from '../Account/SignUpForm/Validate';
import API_URLS from '../../config/apiUrls';

const Logo = () => {
    const [logoSrc, setLogoSrc] = useState('');

    useEffect(() => {
        const tableqr = getCookie('tableqr') ? getCookie('tableqr').split('/')[1] : null;
        if (tableqr) {
            // Fetch the logo URL based on the tableqr value
            const fetchLogoSrc = async (manaId) => {
                try {
                    const url = manaId ? API_URLS.API + `Promotions/GetByDescription/logo/${manaId}` : API_URLS.API + 'Promotions/GetByDescription/logo';
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const data = await response.json();
                    setLogoSrc(data.image);
                } catch (error) {
                    console.error("Failed to fetch logo URL:", error);
                }
            };
            fetchLogoSrc(tableqr);
        }
    }, []);

    const handleLogoClick = () => {
        const tableqr = getCookie('tableqr');
        window.location.href = `/?tableqr=${tableqr}`;
    };

    return (
        <>
            <img
                src={logoSrc || "https://file.garden/Z1wpFckJxRiY2oOg/b1a9ff71-1956-4f64-8ccc-e8ff999b8bc7.jpeg"}
                alt="Company logo"
                className="logo"
                loading="lazy"
                onClick={handleLogoClick}
            />
            <style jsx>{`
                .logo {
                    aspect-ratio: 4.67;
                    cursor: pointer;
                    object-position: center;
                    width: 125px;
                    height: 125%;
                    max-width: 100%;
                    margin: 0 0;
                }
            `}</style>
        </>
    );
};

export default Logo;
