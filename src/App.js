import { useRef, useEffect, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [barcode, setBarcode] = useState(null);
  const [basket, setBasket] = useState([]);

  const openCamera = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 300,
          height: 300,
          facingMode: "environment",
        },
      })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const ctx = canvasRef.current.getContext("2d");
        const barcodeDetector = new window.BarcodeDetector({
          formats: ["qr_code", "ean_13"],
        });
        setInterval(() => {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
          );
          barcodeDetector
            .detect(canvasRef.current)
            .then(([detectedBarcode]) => {
              if (detectedBarcode) {
                setBarcode(detectedBarcode.rawValue);
              }
            })
            .catch((err) => console.error(err));
        }, 100);
      })
      .catch((err) => alert(err));
  };

  useEffect(() => {
    if (barcode) {
      const API_URL = `http://localhost/api.php?barcode=${barcode}`;

      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setBasket([...basket, data]);
          } else {
            alert("This product was not found!");
          }
        })
        .catch((error) => console.error("Error fetching data:", error));
    }
  }, [barcode, basket]);

  return (
    <>
      <button onClick={openCamera}>Open Camera</button>
      <div>
        <video ref={videoRef} autoPlay muted hidden />
        <canvas ref={canvasRef} />
      </div>
      {barcode && <div>Found barcode: {barcode}</div>}
      {basket &&
        basket.map((item) => (
          <div key={item.id}>
            {item.product} <br />
            {item.price} <br />
            <img
              src={item.image}
              style={{ width: 100, height: 100 }}
              alt={item.product}
            />
          </div>
        ))}
    </>
  );
}

export default App;
