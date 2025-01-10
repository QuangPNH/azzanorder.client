import React, { useState, useEffect } from 'react';
import { getCookie } from '../Account/SignUpForm/Validate';
import API_URLS from '../../config/apiUrls';

const Logo = () => {
    const [logoSrc, setLogoSrc] = useState('');
    const tableqr = getCookie('tableqr');
    
    useEffect(() => {
        if (tableqr) {
            const manaId = tableqr.split('/')[1];
            // Fetch the logo URL based on the tableqr value
            const fetchLogoSrc = async (manaId) => {
                try {
                    const url = manaId ? API_URLS.API + `Promotions/GetByDescription/logo/${manaId}` : API_URLS.API + 'Promotions/GetByDescription/logo';
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        setLogoSrc(data.image);
                    }
                    else{
                        setLogoSrc('');
                    }
                } catch (error) {
                    console.error("Failed to fetch logo URL:", error);
                }
            };
            fetchLogoSrc(manaId);
        }
    }, [tableqr]);

    const handleLogoClick = () => {
        window.location.href = "/";
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
