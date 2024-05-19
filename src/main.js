import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Main() {
    const [state, setState] = useState([]);
    const [value, setValue] = useState('');
    const [price, setPrice] = useState(0);
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
        let scanner = null;

        if (scanning) {
            scanner = new Html5QrcodeScanner('reader', {
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
                },
                (error) => console.warn('QR Code scanner error:', error)
            );
        }

        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    };

    const handleDestinationFocus = () => {
        setScanning(true);
    };

    const handleDestinationBlur = () => {
        setScanning(false);
    };
    const handleSubmit = ()=>{
        if(allowedLocation.includes(qrCodeData)){
            console.log("Valid")
            const post = {
                "id":id,
                "item_name": selected.item_name,
                "location":qrCodeData,
            }
            const postReq = fetch("https://api-staging.inveesync.in/test/submit",{
                method:'POST',
                body: JSON.stringify(post)
            })
        }
        else{
            alert("INVALID")
            console.log("INVALID")
        }
    }

    const handleItemSelected = (itemId) => {
        const selectedItem = state.find(item => item.id === parseInt(itemId));
        setValue(selectedItem ? selectedItem.unit : '');
        setAllowedLocation(selectedItem ? selectedItem.allowed_locations : []);
        setId(selectedItem.id)
        setSelected(selectedItem); // Update selected state directly with selectedItem
    };

    return (
        <div className="parent">
            <div className="upperContainer">
                <div className="dropDown">
                    <label>Select Items</label>
                    <div>
                        <select onChange={(e) => handleItemSelected(e.target.value)}>
                            <option>Select Item</option>
                            {state.map(item => (
                                <option key={item.id} value={item.id}>{item.item_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="quantity">
                    <div>
                        <label>Quantity</label>
                        <br />
                        <input
                            onChange={(e) => setPrice(e.target.value)}
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
                <p>{price}</p>
            </div>
            <div className="lowerContainer">
                <div>
                    <label>Destination Location</label>
                    <br />
                    <input
                        className="qrCode"
                        type="text"
                        value={qrCodeData}
                        onFocus={handleDestinationFocus}
                        onBlur={handleDestinationBlur}
                        readOnly
                    />
                </div>
                <div id='reader'></div>
            </div>
            <button type='click' onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default Main;







const hasvdhdf= fetch('api', {
    method: 'POST',
    body: {

    }
})
hasvdhdf.then(res=>res.json()).then(response => console.log(response))