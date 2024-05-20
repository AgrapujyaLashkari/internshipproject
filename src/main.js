import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Import the CSS file

function Main() {
    const [state, setState] = useState([]);
    const [value, setValue] = useState('');
    const [price, setPrice] = useState('none');
    const [selected, setSelected] = useState({});
    const [id, setId] = useState(-1)
    const [qrCodeData, setQrCodeData] = useState("");
    const [scanning, setScanning] = useState(false);
    const [allowedLocation, setAllowedLocation] = useState([]);

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        initializeScanner();
    }, [scanning]);

    const fetchItems = () => {
        fetch("https://api-staging.inveesync.in/test/get-items")
            .then(response => response.json())
            .then(data => setState(data))
            .catch(error => console.error('Error fetching items:', error));
    };

    const initializeScanner = () => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner('reader', {
                qrbox: {
                    width: 250,
                    height: 250,
                },
                fps: 5,
            });

            scanner.render(
                (result) => {
                    scanner.clear();
                    setQrCodeData(result);
                    setScanning(false); // Stop scanning after a successful read
                },
                (error) => console.warn('QR Code scanner error:', error)
            );
        }
    };
    const handle = ()=>{
        setScanning(!scanning)
    }
    // const handleDestinationFocus = () => {
    //     setScanning(true);
    // };

    // const handleDestinationBlur = () => {
    //     setScanning(false);
    // };

    const handleSubmit = () => {
        if (allowedLocation.includes(qrCodeData)) {
            const post = {
                id: id,
                item_name: selected.item_name,
                location: qrCodeData,
            };
            fetch("https://api-staging.inveesync.in/test/submit", {
                method: 'POST',
                body: JSON.stringify(post),
            })
                .then(response => response.json())
                .then(() => {
                    toast.success("Successful", { autoClose: 2000 });
                })
                .catch(error => {
                    toast.error("Failed, Try again", { autoClose: 2000 });
                    console.error('Error submitting data:', error);
                });
        } else {
            toast.error("Failed, Try again", { autoClose: 2000 });
        }
    };

    const handleItemSelected = (itemId) => {
        const selectedItem = state.find(item => item.id === parseInt(itemId));
        setValue(selectedItem ? selectedItem.unit : '');
        setAllowedLocation(selectedItem ? selectedItem.allowed_locations : []);
        setId(selectedItem.id)
        setSelected(selectedItem);
    };

    const numberToText = (number) => {
        const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const teens = ['', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        if (number === 0) {
            return 'zero';
        }

        if (number < 0) {
            return 'minus ' + numberToText(-number);
        }

        if (number < 10) {
            return units[number];
        }

        if (number < 20) {
            return teens[number - 10];
        }

        if (number < 100) {
            return tens[Math.floor(number / 10)] + (number % 10 !== 0 ? ' ' + units[number % 10] : '');
        }

        if (number < 1000) {
            return units[Math.floor(number / 100)] + ' hundred' + (number % 100 !== 0 ? ' ' + numberToText(number % 100) : '');
        }

        if (number < 100000) {
            return numberToText(Math.floor(number / 1000)) + ' thousand' + (number % 1000 !== 0 ? ' ' + numberToText(number % 1000) : '');
        }

        if (number < 10000000) {
            return numberToText(Math.floor(number / 100000)) + ' lakh' + (number % 100000 !== 0 ? ' ' + numberToText(number % 100000) : '');
        }

        if (number < 1000000000) {
            return numberToText(Math.floor(number / 10000000)) + ' crore' + (number % 10000000 !== 0 ? ' ' + numberToText(number % 10000000) : '');
        }

        return 'out of range';
    };

    return (
        <div className="parent">
            <div className="upperContainer">
                <div className="dropDown">
                    <label>Select Items</label>
                    <select onChange={(e) => handleItemSelected(e.target.value)}>
                        <option>Select Item</option>
                        {state.map(item => (
                            <option key={item.id} value={item.id}>{item.item_name}</option>
                        ))}
                    </select>

                </div>
                <div className="quantity">
                    <div>
                        <label>Quantity</label>
                        <br />
                        <input
                            onChange={(e) => {
                                setPrice(numberToText(e.target.value))
                            }}
                            min={0}
                            className="number"
                            type="number"
                        />
                    </div>
                    <div>
                        <label>Unit</label>
                        <br />
                        <input value={value} className="unit" type="text" readOnly />
                    </div>
                </div>
                <div className='price'>{price}</div>
            </div>
            <div className="lowerContainer">
                <div>
                    <label>Destination Location</label>
                    <br />
                    <input
                        className="qrCode"
                        type="text"
                        value={qrCodeData}
                        // onFocus={handleDestinationFocus}
                        // onBlur={handleDestinationBlur}
                        onClick={handle}
                        readOnly
                    />
                </div>
            </div>
            {scanning && (
                <div className="modal">
                    <div id="reader"></div>
                    <button className='modalClose' onClick={handle}>X</button>
                </div>
            )}
            <button type='button' onClick={handleSubmit}>Submit</button>
            <ToastContainer />
        </div>
    );
}

export default Main;