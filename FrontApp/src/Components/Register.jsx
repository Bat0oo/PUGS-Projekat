import React, { useEffect, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import '../Style/RegisterPage.css';
import { gapi } from 'gapi-script';
import { Link } from 'react-router-dom';
import { RegularRegisterApiCall } from '../Services/RegisterServices.js';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const regularRegisterApiEndpoint = process.env.REACT_APP_REGULAR_REGISTER_API_URL;

    const [firstName, setFirstName] = useState('');
    const [firstNameError, setFirstNameError] = useState(true);

    const [lastName, setLastName] = useState('');
    const [lastNameError, setLastNameError] = useState(true);

    const [birthday, setBirthday] = useState('');
    const [birthdayError, setBirthdayError] = useState(true);

    const [address, setAddress] = useState('');
    const [addressError, setAddressError] = useState(true);

    const [username, setUsername] = useState('');
    const [usernameError, setUsernameError] = useState(true);

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(true);

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(true);

    const [repeatPassword, setRepeatPassword] = useState('');
    const [repeatPasswordError, setRepeatPasswordError] = useState(true);

    const [typeOfUser, setTypeOfUser] = useState('Driver');
    const [typeOfUserError, setTypeOfUserError] = useState(false);

    const [imageUrl, setImageUrl] = useState(null);
    const [imageUrlError, setImageUrlError] = useState(true);

    const [userGoogleRegister, setUserGoogleRegister] = useState('');
    const navigate = useNavigate();
    const handleRegisterClick = async (e) => {
        e.preventDefault();

        const resultOfRegister = await RegularRegisterApiCall(
            firstNameError,
            lastNameError,
            birthdayError,
            addressError,
            usernameError,
            emailError,
            passwordError,
            repeatPasswordError,
            imageUrlError,
            firstName,
            lastName,
            birthday,
            address,
            email,
            password,
            repeatPassword,
            imageUrl,
            typeOfUser,
            username,
            regularRegisterApiEndpoint
        );
        if (resultOfRegister) {
            alert("Successfully registered!");
            navigate("/");
        }
    };

    const handleTypeOfUserChange = (e) => {
        const value = e.target.value;
        setTypeOfUser(value);
        if (value.trim() === '') {
            setTypeOfUserError(true);
        } else {
            setTypeOfUserError(false);
        }
    };

    const handleInputChange = (setter, errorSetter) => (e) => {
        const value = e.target.value;
        setter(value);
        errorSetter(value.trim() === '');
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        setEmailError(!isValidEmail);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        const isValidPassword = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(value);
        setPasswordError(!isValidPassword);
    };

    const handleRepeatPasswordChange = (e) => {
        const value = e.target.value;
        setRepeatPassword(value);
        setRepeatPasswordError(value !== password);
    };

    const handleImageUrlChange = (e) => {
        const selectedFile = e.target.files[0];
        setImageUrl(selectedFile || null);
        setImageUrlError(!selectedFile);
    };

    useEffect(() => {
        if (clientId) {
            function start() {
                gapi.client.init({
                    clientId: clientId,
                    scope: ""
                });
            }
            gapi.load('client:auth2', start);
        } else {
            console.error("Client ID is not defined in .env file");
        }
    }, [clientId]);

    const onSuccess = (res) => {
        const profile = res.profileObj;
        // console.log(profile);
        // setUserGoogleRegister(profile);
        // console.log("User google register:",userGoogleRegister);
        setEmail(profile.email);
        setFirstName(profile.givenName);
        setLastName(profile.familyName);


        setEmailError(!profile.email);
        setFirstNameError(!profile.givenName);
        setLastNameError(!profile.familyName);

        alert("Please complete other fields!");
    }



    const onFailure = (res) => {
        console.log("Failed to register:", res);
    }
/*
    const handleCustomGoogleLogin = () => {
        const auth2 = gapi.auth2.getAuthInstance();
        auth2.signIn().then(
            (googleUser) => {
                onSuccess({ profileObj: googleUser.getBasicProfile() });
            },
            (error) => {
                onFailure(error);
            }
        );
    };
    */


    return (
        <>
            <ul class="background">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
            <div>
                <div className="card">
                    <div className="card2">
                        <form class="form" onSubmit={handleRegisterClick} encType="multipart/form-data" method='post'>
                            <p id="heading">Registration</p>
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
                                                        d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z"
                                                    ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: firstNameError ? '#EF4444' : '#E5E7EB' }}
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={firstName || ''}
                                                    onChange={handleInputChange(setFirstName, setFirstNameError)}
                                                    required
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
                                                        d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z"
                                                    ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: lastNameError ? '#EF4444' : '#E5E7EB' }}
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={lastName || ''}
                                                    onChange={handleInputChange(setLastName, setLastNameError)}
                                                    required
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td ><label>Date of birth</label></td>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
                                                        d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"
                                                    ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: birthdayError ? '#EF4444' : '#E5E7EB' }}
                                                    type="date"
                                                    value={birthday || ''}
                                                    onChange={handleInputChange(setBirthday, setBirthdayError)}
                                                    required
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
                                                        d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z">
                                                    </path>

                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: addressError ? '#EF4444' : '#E5E7EB' }}
                                                    type="text"
                                                    placeholder="Address"
                                                    value={address || ''}
                                                    onChange={handleInputChange(setAddress, setAddressError)}
                                                    required
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                 <path
                                                        d="M4 4h16v2H4zM4 10h16v2H4zM4 16h16v2H4z">
                                                    </path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: usernameError ? '#EF4444' : '#E5E7EB' }}
                                                    type="text"
                                                    placeholder="Username"
                                                    value={username || ''}
                                                    onChange={handleInputChange(setUsername, setUsernameError)}
                                                    required
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
                                                        d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"
                                                    ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: emailError ? '#EF4444' : '#E5E7EB' }}
                                                    type="email"
                                                    placeholder="Email"
                                                    value={email || ''}
                                                    onChange={handleEmailChange}
                                                    required
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                    <path
            d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
          ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: passwordError ? '#EF4444' : '#E5E7EB' }}
                                                    type="password"
                                                    title='Password needs 8 characters, one capital letter, number, and special character'
                                                    placeholder="Password"
                                                    value={password || ''}
                                                    onChange={handlePasswordChange}
                                                    required
                                                />
                                            </div>
                                        </td>
                                        <td>
                                            <div class="field">
                                                <svg
                                                    viewBox="0 0 16 16"
                                                    fill="currentColor"
                                                    height="16"
                                                    width="16"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="input-icon"
                                                >
                                                      <path
            d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
          ></path>
                                                </svg>
                                                <input
                                                    className="input-field"
                                                    style={{ borderColor: repeatPasswordError ? '#EF4444' : '#E5E7EB' }}
                                                    type="password"
                                                    placeholder="Repeat Password"
                                                    value={repeatPassword || ''}
                                                    onChange={handleRepeatPasswordChange}
                                                    required
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className='label'>Type of user:</label></td>
                                        <td>

                                            <select className="input-field"
                                                style={{ borderColor: typeOfUserError ? '#EF4444' : '#E5E7EB' }}
                                                value={typeOfUser}
                                                onChange={handleTypeOfUserChange}

                                            >
                                                <option>Driver</option>
                                                <option>Rider</option>
                                                <option>Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className='font-serif font-bold'>Profile picture:</label></td>
                                        <td>
                                            <input
                                                type="file"
                                                onChange={handleImageUrlChange}
                                                required
                                            /></td>
                                    </tr>
                                </tbody>
                            </table>
                            <button type="submit" className="button1">Register</button>
                            <br/>
                            <GoogleLogin
                        clientId={clientId}
                        buttonText="Register with Google"
                        onSuccess={onSuccess}
                        onFailure={onFailure}
                        cookiePolicy={'single_host_origin'}
                        className='button1'
                    />
                            <p className="signup-link">Already have an account? &nbsp;
                                {/* <a href="#" className="text-gray-800 font-bold">Sign up</a> */}
                                <Link to="/" className="text-gray-800 font-bold">Login</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
}
