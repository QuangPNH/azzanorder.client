import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import Banner from '../components/HomeItem/Banner';
import AboutUs from './AboutUsComponent/AboutUs';
import API_URLS from '../config/apiUrls';
import { getCookie } from './Account/SignUpForm/Validate';


const Homepage = () => {
    const manaId = getCookie("tableqr");
    const [about, setAbout] = useState();
    useEffect(() => {
        fetchAbout(manaId.split('/')[1]);
    }, []);
    const fetchAbout = async (id) => {
        try {
            const response = await fetch(API_URLS.API + `Abouts?ownerId=${id}`);
            const data = await response.json();
            setAbout(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };
    return (
        <>
            <Header />
            {about && (
                <div>
                    {about.map((a) => (
                        <AboutUs key={a.id} title={a.title} content={a.content} />
                    ))}
                </div>
            )};
            <Footer />
        </>
    );
};

export default Homepage;
