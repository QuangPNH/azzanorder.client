﻿import React, { useState, useEffect } from 'react';
import TopBar from './MenuDetail/TopBar';
import ProductCardSingle from './MenuDetail/ProductCardSingle';
import AmountBar from './MenuDetail/AmountBar';
import ToppingAdd from './MenuDetail/ToppingAdd';
import AddToCartButton from './MenuDetail/AddToCartButton';
import Description from './MenuDetail/Description';
import CustomItem from './MenuDetail/CustomItem';
import ShowMoreLink from './ShowMoreLink/ShowMoreLink';
import ProductCard from './ProductCard/ProductCard';
import { getCookie, setCookie } from './Account/SignUpForm/Validate';
import API_URLS from '../config/apiUrls';

const ItemDetail = ({ closeModal, imageSrc, key, title, price, discount, cate, desc, id }) => {
    const [products, setProducts] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [selectedSugar, setSelectedSugar] = useState('50');
    const [selectedIce, setSelectedIce] = useState('50');
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [selectedToppings, setSelectedToppings] = useState([]);
    const manaId = getCookie("tableqr");
    useEffect(() => {
        fetchProducts({ cate });
        fetchToppings(manaId.split('/')[1]);
    }, []);

    const fetchProducts = async (category) => {
        try {
            const response = await fetch(API_URLS.API + `MenuItem/Category/${category.cate}`);
            const data = await response.json();
            const limitedData = data.slice(0, 4); // Get only the first 4 items from the data array
            setProducts(limitedData);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchToppings = async (manaId) => {
        try {
            const response = await fetch(API_URLS.API + `MenuItem/Category/TOPPING?id=${manaId}`);
            const data = await response.json();
            setToppings(data);
        } catch (error) {
            console.error('Error fetching toppings:', error);
        }
    };

    const handleToppingChange = (topping, isChecked) => {
        setSelectedToppings(prevToppings => {
            if (isChecked) {
                return [...prevToppings, topping];
            } else {
                return prevToppings.filter(t => t.name !== topping.name);
            }
        });
    };
    
    const arraysEqual = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        const sortedArr1 = arr1.slice().sort((a, b) => a.name.localeCompare(b.name));
        const sortedArr2 = arr2.slice().sort((a, b) => a.name.localeCompare(b.name));
        return sortedArr1.every((item, index) => item.name === sortedArr2[index].name);
    };
    const handleAddToCart = () => {
        const storedData = getCookie('cartData');
        let parsedData = [];
        if (storedData) {
            parsedData = JSON.parse(storedData);
        }

        const formattedOptions = {
            selectedSugar,
            selectedIce,
            selectedToppings: selectedToppings
        };

        const existingItemIndex = parsedData.findIndex(item =>
            item.name === title &&
            item.options.selectedSugar === selectedSugar &&
            item.options.selectedIce === selectedIce &&
            arraysEqual(item.options.selectedToppings, selectedToppings)
        );   
            if (existingItemIndex !== -1) {
                // Item exists, increase quantity
                parsedData[existingItemIndex].quantity += currentQuantity;
            } else {
                // Item does not exist, add new item
                const newItem = {
                    key: key,
                    id: id,
                    name: title,
                    options: formattedOptions,
                    price: price,
                    quantity: currentQuantity,

                };
                parsedData.push(newItem);
            }
        setCookie("cartData", JSON.stringify(parsedData), 0.02);
        alert("Add success!");
    };
    
    const modifiedDesc = desc ? desc.split('/').slice(1).join('/') : desc;

    return (
        <>
            <TopBar closeModal={closeModal} />
            <ProductCardSingle
                imageSrc={imageSrc}
                name={title}
                price={price}
                onQuantityChange={setCurrentQuantity}
            />

            {desc && !desc.includes('food') && (
                <>

                    <div>
                        <CustomItem title="Sugar amount:" />
                        <AmountBar selectedValue={selectedSugar} onStepClick={setSelectedSugar} />
                    </div>

                    <div>
                        <CustomItem title="Ice amount:" />
                        <AmountBar selectedValue={selectedIce} onStepClick={setSelectedIce} />
                    </div>


                    <div>
                        <CustomItem title="Toppings:" />
                        {toppings && toppings.length > 0 && toppings.map((topping) => {
                            // Only show topping if both conditions match
                            if (!topping.description.includes('food')) {
                                return (
                                    <ToppingAdd
                                        key={topping.menuItemId}
                                        toppingName={topping.itemName}
                                        toppingNameEnglish={topping.description}
                                        toppingPrice={topping.price}
                                        onToppingChange={handleToppingChange}
                                    />
                                );
                            }
                        })}
                    </div>
                </>
            )}
            {desc && desc.includes('food') && (
                <div>
                    <CustomItem title="Toppings:" />
                    {toppings && toppings.length > 0 && toppings.map((topping) => {
                        // Only show topping if both conditions match
                        if (desc.includes('food') && topping.description.includes('food')) {
                            return (
                                <ToppingAdd
                                    key={topping.menuItemId}
                                    toppingName={topping.itemName}
                                    toppingNameEnglish={topping.description}
                                    toppingPrice={topping.price}
                                    onToppingChange={handleToppingChange}
                                />
                            );
                        }
                    })}
                </div>
            )}
            <AddToCartButton onClick={handleAddToCart} />
            <Description content={modifiedDesc} />

            <div>
                <ShowMoreLink title='RELATED PRODUCTS' />
                <div className='product-grid'>
                    {products && products.map((product) => (
                        <ProductCard
                            key={product.menuItemId}
                            id={product.menuItemId}
                            imageSrc={product.imageBase64}
                            title={product.title}
                            price={product.price}
                            cate={product.categoryId}
                            desc={product.description}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ItemDetail;
