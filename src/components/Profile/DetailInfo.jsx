import React, { useState, useEffect } from "react";
import ProfileItem from "./ProfileItem"; // Assuming ProfileItem is in the same folder

const DetailInfo = ({ title, memberDetail, onChange, readOnly }) => {
    const [value, setValue] = useState(memberDetail);

    useEffect(() => {
        setValue(memberDetail);
    }, [memberDetail]);

    const handleChange = (e) => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <>
            <section className="detail-info">
                <ProfileItem title={title} />
                <input
                    className="member-detail"
                    type="text"
                    value={value}
                    onChange={handleChange}
                    readOnly={readOnly}
                />
            </section>
            <style jsx>{`
                .detail-info {
                    display: flex;
                    width: calc(100% - 50px); /* Takes up full width of the parent minus padding */
                    gap: 9px;
                    font-family: Inter, sans-serif;
                    color: #000;
                    border-radius: 6px;
                    align-items: center; /* Aligns items vertically at the center */
                    margin-bottom: 5px; /* Added margin for spacing between DetailInfo components */
                    padding: 0 10px; /* Adds padding to the left and right */
                    box-sizing: border-box; /* Ensures padding is included in the element's total width and height */
                }
                .detail-info > :first-child {
                    flex: 0 0 30%; /* ProfileItem takes up 30% of the width */
                }
                .detail-info > :last-child {
                    flex: 0 0 70%; /* Input takes up 70% of the width */
                }
                .member-detail {
                    font-size: 14px;
                    font-weight: 400;
                    white-space: nowrap;
                    padding: 8px 12px; /* Increase padding to make input bigger */
                    border: 1px solid #000;
                    border-radius: 6px;
                    margin: 0;
                    width: 100%; /* Ensures it stretches to full width */
                    min-width: 0; /* Prevents minimum width from affecting layout */
                }
            `}</style>
        </>
    );
};

export default DetailInfo;