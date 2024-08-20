import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../Style/Dashboard.css'; // Ensure this path matches your project structure
import { MdPerson } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import { FaCar } from 'react-icons/fa';
import { FaRoad } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { GetAllDrivers } from '../Services/AdminService.js';
import DriversView from './DriversView.jsx';
import '../Style/Profile.css';
import { makeImage, convertDateTimeToDateOnly, changeUserFields } from '../Services/ProfileService';
import { getUserInfo } from '../Services/ProfileService';
import VerifyDrivers from './VerifyDrivers.jsx';
import RidesAdmin from './RidesAdmin.jsx';

export default function DashboardAdmin(props) {

    const user = props.user;
    const apiEndpoint = process.env.REACT_APP_CHANGE_USER_FIELDS;
    const userId = user.id;
    console.log(userId);
    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();

    const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;
    const [currentUser, setUserInfo] = useState('');

    const [address, setAddress] = useState('');
    const [averageRating, setAverageRating] = useState('');
    const [birthday, setBirthday] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState();
    const [imageFile, setImageFile] = useState('');
    const [isBlocked, setIsBlocked] = useState('');
    const [isVerified, setIsVerified] = useState('');
    const [lastName, setLastName] = useState('');
    const [numOfRatings, setNumOfRatings] = useState('');
    const [password, setPassword] = useState('');
    const [roles, setRoles] = useState('');
    const [status, setStatus] = useState('');
    const [sumOfRatings, setSumOfRatings] = useState('');
    const [username, setUsername] = useState('');

    const [view, setView] = useState('editProfile');
    const [isEditing, setIsEditing] = useState(false);

    //pw repeat
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // Initial user info state
    const [initialUser, setInitialUser] = useState({});

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getUserInfo(jwt, apiForCurrentUserInfo, userId);
                const user = userInfo.user;
                console.log(user);
                setUserInfo(user); // Update state with fetched user info
                setInitialUser(user); // Set initial user info

                setAddress(user.address);
                setAverageRating(user.averageRating);
                setBirthday(convertDateTimeToDateOnly(user.birthday));
                setEmail(user.email);
                setFirstName(user.firstName);
                setImageFile(makeImage(user.imageFile));
                setIsBlocked(user.isBlocked);
                setIsVerified(user.isVerified);
                setLastName(user.lastName);
                setNumOfRatings(user.numOfRatings);
                setPassword(user.password);
                setRoles(user.roles);
                setStatus(user.status);
                setSumOfRatings(user.sumOfRatings);
                setUsername(user.username);
            } catch (error) {
                console.error('Error fetching user info:', error.message);
            }
        };

        fetchUserInfo();
    }, [jwt, apiForCurrentUserInfo, userId]);

    const [driversView, setDriversView] = useState('');



    const handleSaveClick = async () => {
        const ChangedUser = await changeUserFields(apiEndpoint, firstName, lastName, birthday, address, email, password, selectedFile, username, jwt, newPassword, repeatNewPassword, oldPassword, userId);
        console.log("Changed user:", ChangedUser);

        setInitialUser(ChangedUser);
        setUserInfo(ChangedUser);
        setAddress(ChangedUser.address);
        setAverageRating(ChangedUser.averageRating);
        setBirthday(convertDateTimeToDateOnly(ChangedUser.birthday));
        setEmail(ChangedUser.email);
        setFirstName(ChangedUser.firstName);
        setImageFile(makeImage(ChangedUser.imageFile));
        setIsBlocked(ChangedUser.isBlocked);
        setIsVerified(ChangedUser.isVerified);
        setLastName(ChangedUser.lastName);
        setNumOfRatings(ChangedUser.numOfRatings);
        setPassword(ChangedUser.password);
        setRoles(ChangedUser.roles);
        setStatus(ChangedUser.status);
        setSumOfRatings(ChangedUser.sumOfRatings);
        setUsername(ChangedUser.username);
        setOldPassword('');
        setNewPassword('');
        setRepeatNewPassword('');
        setIsEditing(false);
    }


    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleShowDrivers = async () => {
        try {
            setView('drivers');
        } catch (error) {
            console.error('Error fetching drivers:', error.message);
        }
    };

    const handleShowDriversForVerification = async () => {
        try {
            setView('verify');
        } catch (error) {
            console.error('Error fetching drivers:', error.message);
        }
    };

    const handleShowAllRides = async () =>{
        try{
            setView('rides');
        }catch(error){
            console.error("Error when I try to show all rides", error);
        }
    };

    const handleEditProfile = async () => {
        try {
            setView('editProfile');
        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setAddress(initialUser.address);
        setAverageRating(initialUser.averageRating);
        setBirthday(convertDateTimeToDateOnly(initialUser.birthday));
        setEmail(initialUser.email);
        setFirstName(initialUser.firstName);
        setImageFile(makeImage(initialUser.imageFile));
        setIsBlocked(initialUser.isBlocked);
        setIsVerified(initialUser.isVerified);
        setLastName(initialUser.lastName);
        setNumOfRatings(initialUser.numOfRatings);
        setPassword(initialUser.password);
        setRoles(initialUser.roles);
        setStatus(initialUser.status);
        setSumOfRatings(initialUser.sumOfRatings);
        setUsername(initialUser.username);
        setOldPassword('');
        setNewPassword('');
        setRepeatNewPassword('');
        setSelectedFile(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageFile(reader.result);
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <div className="black-headerDashboar flex justify-between items-center p-4">
                <button className="button-logout" onClick={handleSignOut}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaSignOutAlt size={25} style={{ marginRight: '4px' }} />
                        <span>Sign out</span>
                    </div>
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'black', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', columnGap: '10px' }}>
                    <div>
                        <p style={{ color: "white", textAlign: "left", fontSize: "20px" }}>{username}</p>
                    </div>
                    <div>
                        <hr style={{ width: '100px' }}></hr>
                    </div>
                    <button className="button" onClick={handleEditProfile}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <MdPerson size={25} style={{ marginRight: '30px' }} />
                            <span>Profile</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleShowDriversForVerification}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FaCheckCircle size={25} style={{ marginRight: '30px' }} />
                            <span>Verify drivers</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleShowDrivers}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FaCar size={25} style={{ marginRight: '30px' }} />
                            <span>Drivers</span>
                        </div>
                    </button>
                    <button className="button" onClick={handleShowAllRides}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FaRoad size={25} style={{ marginRight: '30px' }} />
                            <span>Rides</span>
                        </div>
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '100%', display: 'flex' }}>


                        {view == "editProfile" ? (

                            <div style={{ width: '100%', backgroundColor: 'white' }}>
                                <div>
                                    <div className="custom-style">Edit profile</div>
                                    <div>
                                        <img src={imageFile} alt="User" style={{ width: '100px', height: '100px', marginLeft: '30px', marginTop: '20px', borderRadius: '50%' }} />
                                    </div>
                                    {isEditing ? (
                                        <div className='customView-div' style={{ marginLeft: '30px', marginTop: '20px' }}>
                                            <input type='file' onChange={handleImageChange} />
                                        </div>
                                    ) : (
                                        <div className='customView-div'></div>
                                    )}
                                    <div style={{ marginLeft: '30px', marginTop: '20px' }}>
                                        <div className='customProfile-div'>Username</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>{username}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>First name</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>{firstName}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Last name</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>{lastName}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Address</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='text' value={address} onChange={(e) => setAddress(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>{address}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Birthday</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='text' value={birthday} onChange={(e) => setBirthday(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>{birthday}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Email</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='email' value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '250px' }} />
                                        ) : (
                                            <div className='customView-div'>{email}</div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Old password</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='password' value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>
                                                <input className='customView-div' type='password' placeholder='********' disabled />
                                            </div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>New password</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>
                                                <input className='customView-div' type='password' placeholder='********' disabled />
                                            </div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <div className='customProfile-div'>Repeat new password</div>
                                        {isEditing ? (
                                            <input className='customView-div' type='password' value={repeatNewPassword} onChange={(e) => setRepeatNewPassword(e.target.value)} />
                                        ) : (
                                            <div className='customView-div'>
                                                <input className='customView-div' type='password' placeholder='********' disabled />
                                            </div>
                                        )}
                                        <hr className='customProfile-hr' />
                                        <br />
                                        {isEditing ? (
                                            <div>
                                                <button className='edit-button' onClick={handleSaveClick}>Save</button>
                                                <button className='edit-button' onClick={handleCancelClick}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div>
                                                <button className='edit-button' onClick={handleEditClick}>Edit</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : view === 'drivers' ? (
                            <DriversView />
                        ) : view=='verify' ? (
                            <VerifyDrivers/>
                        ) : view=='rides' ? (
                            <RidesAdmin/>
                        ) : null}
                    </div>

                </div>
            </div>

        </div>

    );
}
