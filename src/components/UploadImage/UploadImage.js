import { useState, useRef, useEffect } from "react";
import {
  db,
  storage,
  doc,
  setDoc,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "../../assets/utility/firebase";
import { useStateValue } from "../../assets/utility/StateProvider";
import { LinearProgress } from "@mui/material";

function UploadImage() {
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [{ user, logo }, dispatch] = useStateValue();

  const fileImgRef = useRef();
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(image);
    } else {
      setPreview(null);
    }
  }, [image]);

  const handleClick = (e) => {
    e.preventDefault();
    fileImgRef.current.click();
  };
  const handleChange = (e) => {
    // setImage(e.target.files[0]);
    const file = e.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      setImage(file);
    } else {
      setImage(null);
    }
  };
  const formHandler = () => {
    if (!image) {
      dispatch({
        type: "ALERT__ERROR",
        item: "Kliknij zdjęcie i wybierz nowe zdjęcie, później wybierz przycisk zmień logo",
      });
    }
    uploadFiles(image);
  };

  const uploadFiles = (file) => {
    //
    if (!file) return;
    const sotrageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(sotrageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then(async (url) => {
            await setDoc(
              doc(db, "invoices", user?.uid, "logo", "item-logo123"),
              {
                timestamp: new Date(),
                imageUrl: url,
              }
            );
            setProgress(0);
            setImage(null);
          })
          .catch((error) => console.log("err>>", error.message));
      }
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ letterSpacing: "0.5px" }}>
          Kliknij zdjęcie aby wybrać nowe
        </div>
        <LinearProgress
          color="success"
          variant="determinate"
          value={progress}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <input
            type="file"
            className="input"
            onChange={handleChange}
            accept="image/*"
            ref={fileImgRef}
            style={{ display: "none" }}
          />

          {logo ? (
            <img
              style={{ width: "100px", cursor: "pointer" }}
              src={logo}
              alt="logo"
              onClick={handleClick}
            />
          ) : (
            <button onClick={handleClick}>Wybierz Logo</button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {preview ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              style={{
                width: "100px",
                cursor: "pointer",
                marginBottom: "10px",
              }}
              src={preview}
              alt="logo"
              onClick={handleClick}
            />
            <button type="button" onClick={() => setPreview(null)}>
              Wyczyść Podgląd
            </button>
          </div>
        ) : (
          <div
            style={{
              width: "100px",
              height: "100px",
              border: "1px solid grey",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={handleClick}
          >
            Tutaj zobaczysz podgląd
          </div>
        )}
        <button
          type="button"
          onClick={formHandler}
          style={{ marginLeft: "10px" }}
        >
          Zapisz Logo
        </button>
      </div>
    </div>
  );
}

export default UploadImage;
