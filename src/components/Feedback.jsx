﻿import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import FeedbackTitle from './Feedback/FeedbackTitle';
import FeedbackComponent from './Feedback/FeedbackComponent';
import FeedbackForm from './Feedback/FeedbackForm';
import FeedbackNotice from './Feedback/FeedbackNotice';
import FeedbackButton from './Feedback/FeedbackButton';
import { getCookie } from './Account/SignUpForm/Validate';
import API_URLS from '../config/apiUrls';

const FeedbackScreen = () => {
    const [feedback, setContent] = useState(null);

    useEffect(() => {
        const memberInfoCookie = getCookie('memberInfo');
        const tableqr = getCookie('tableqr');
        if (memberInfoCookie != null) {
            fetchContentFromAPI(JSON.parse(memberInfoCookie).memberId, tableqr.split('/')[1])
        } else {
            window.location.href = '';
        }
    }, []);
    const fetchContentFromAPI = async (id, employeeId) => {
        try {
            
            const url = API_URLS.API + `Feedback/ByMemberIdAndEmployeeId/${id}/${employeeId}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setContent(data);
            }
        } catch (error) {
            throw new Error('Error fetching content from API:', error);
        }
    };

    const handleSave = async () => {
        try {
            const method = feedback.feedbackId ? 'PUT' : 'POST';
            const url = feedback.feedbackId
                ? API_URLS.API + 'Feedback/Update'
                : API_URLS.API + 'Feedback/Add';
            const feedbackData = {
                ...feedback,
                memberId: feedback?.memberId || JSON.parse(getCookie('memberInfo')).memberId,
                employeeId: feedback?.employeeId || JSON.parse(getCookie('tableqr').split('/')[1])
            };
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedbackData)
            });
            if (response.ok) {
                alert("Thank you for your feedback, have a nice day!")
            } else {
                console.error('Failed to update member info');
            }
        } catch (error) {
            console.error('Error updating member info:', error);
        }
    };

    const handleChange = (field, value) => {
        setContent((prevInfo) => ({
            ...prevInfo,
            [field]: value
        }));
    };

    return (
        <>
            <Header />
            <div className="feedback-container">
                <FeedbackTitle />
                <FeedbackComponent />
                <div className="feedback-textbox-notice-container">
                    <FeedbackForm data={feedback?.content} onChange={(value) => handleChange('content', value)} />
                    <FeedbackNotice />
                </div>
                <FeedbackButton text='Send' onClick={handleSave}/>
            </div>
            <Footer />
            <style jsx>{`
                .feedback-container {
                    display: flex;
                    flex-direction: column; /* Stack children vertically */
                    align-items: center; /* Center children horizontally */
                }
                .feedback-textbox-notice-container {
                    display: flex;
                    flex-direction: column; /* Align vertically */
                    align-items: center; /* Center children horizontally */
                    margin-top: 15px; /* Add some spacing */
                }
                .feedback-textbox-notice-container > * {
                    margin: 5px 0; /* Add spacing between textbox and notice */
                }
            `}</style>
        </>
    );
};

export default FeedbackScreen;
