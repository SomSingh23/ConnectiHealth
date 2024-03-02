import Navbar from "../Navbar/NavBar";
import { useLoaderData } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import button_logo from "/button_logo/button_logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./patient.css";
import { useEffect } from "react";
import axios from "axios";
function Patient() {
  const role = useLoaderData();
  const navigate = useNavigate();
  const [isPatient, setIsPatient] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  useEffect(() => {
    if (role === "doctor") {
      navigate("/doctor");
    }
  }, []);

  if (role === "noRole" && isPatient === false && isDoctor === false) {
    return (
      <>
        <Navbar isPatient={isPatient} isDoctor={isDoctor} />
        <div className="login_with_google">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              let data = await axios.post(
                "http://localhost:3001/api/auth/generateTokenP",
                {
                  token: credentialResponse.credential,
                }
              );
              localStorage.setItem("token", data.data.token);
              console.log(data.data.token);
              setIsPatient(true);
              setIsLogout(true);
            }}
            onError={() => {
              console.log("Login Failed");
            }}
          />
          <img
            src={button_logo}
            height={"150px"}
            width={"150px"}
            alt="Google Login"
          />

          <p>Login with Google</p>
        </div>
      </>
    );
  }
  return (
    <>
      <Navbar isPatient={isPatient} isLogout={true} />
      <div className="App">
        <h1>My WebRTC App</h1>
        <h2>User Logged In</h2>
      </div>
    </>
  );
}

export default Patient;
