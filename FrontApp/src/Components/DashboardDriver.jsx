import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../Style/Dashboard.css'; // Ensure this path matches your project structure
import { MdPerson } from 'react-icons/md';
import { FaCheckCircle } from 'react-icons/fa';
import { FaCar } from 'react-icons/fa';
import { FaRoad } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import '../Style/Profile.css';
import { makeImage, convertDateTimeToDateOnly, changeUserFields } from '../Services/ProfileService';
import { getUserInfo } from '../Services/ProfileService';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { getAllAvailableRides } from '../Services/DriverService.js'
import { AcceptDrive } from '../Services/DriverService.js';
import { FinishRide } from '../Services/DriverService.js';
import RealTimeClock from './RealTimeClock.jsx';
import {getCurrentRide} from '../Services/DriverService.js';
import RidesDriver from './RidesDriver.jsx'

export default function DashboardDriver(props) {

    const user = props.user;
    const apiEndpoint = process.env.REACT_APP_CHANGE_USER_FIELDS;
    const userId = user.id;
    localStorage.setItem("userId",userId);
    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();

    const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;
    const apiEndpointForCurrentRide = process.env.REACT_APP_CURRENT_TRIP_DRIVER;
    const [currentUser, setUserInfo] = useState('');

    const [address, setAddress] = useState('');
    const [averageRating, setAverageRating] = useState('');
    const [birthday, setBirthday] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState();
    const [imageFile, setImageFile] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
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
    const [tripIsActive, setTripIsActive] = useState(false); // initial false
    //for rides 
    const [rides, setRides] = useState([]);
    const [currentRide, setCurrentRides] = useState();
    const apiToGetAllRides = process.env.REACT_APP_GET_ALL_RIDES_ENDPOINT;
    const apiEndpointFinishTrip = process.env.REACT_APP_FINISH_TRIP;
    const [minutesToDriverArrive, setMinutesToDriverArrive] = useState(null);
    const [minutesToEndTrip, setMinutesToEndTrip] = useState(null);


    const [clockSimulation, setClockSimulation] = useState();
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

    const handleSaveClick = async () => {
        console.log("Address",address);
        const ChangedUser = await changeUserFields(apiEndpoint, firstName, lastName, birthday, address, email, password, selectedFile, username, jwt, newPassword, repeatNewPassword, oldPassword, userId);

        console.log("Changed user:",ChangedUser);

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

    const handleEditProfile = async () => {
        try {
            setView('editProfile');
        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };

    const handleViewRides = async () => {
        try {
            fetchRides();
            setView('rides');
        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };

    const fetchRides = async () => {
        try {
            const data = await getAllAvailableRides(jwt, apiToGetAllRides);
            console.log("Rides:", data);
            setRides(data.rides);
            console.log("Seted rides", rides);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const apiAcceptDrive = process.env.REACT_APP_ACCEPT_RIDE;
    const handleAcceptNewDrive = async (tripId) => {
        try {
            const data = await AcceptDrive(apiAcceptDrive, userId, tripId, jwt); // Drive accepted
            setCurrentRides(data.ride);
            setTripIsActive(true);
            setMinutesToDriverArrive(data.ride.minutesToDriverArrive);
            setMinutesToEndTrip(data.ride.minutesToEndTrip);
        } catch (error) {
            console.error('Error accepting drive:', error.message);
        }
    };



    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleDriveHistory = () => {
        setView("driveHistory");
    }

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


    useEffect(() => {
        const fetchRideData = async () => {
            try {
                const data = await getCurrentRide(jwt, apiEndpointForCurrentRide, userId);
                console.log("Active trip:", data);

                if (data.error && data.error.status === 400) {
                    setClockSimulation("You don't have an active trip!");
                    return;
                }

                if (data.trip) {
                    console.log("Active trip:", data.trip);

                    if (data.trip.accepted && data.trip.secondsToDriverArrive > 0) {
                        setClockSimulation(`You will arrive in: ${data.trip.secondsToDriverArrive} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToEndTrip > 0) {
                        setClockSimulation(`The trip will end in: ${data.trip.secondsToEndTrip} seconds`);
                    } else if (data.trip.accepted && data.trip.secondsToDriverArrive === 0 && data.trip.secondsToEndTrip === 0) {
                        setClockSimulation("Your trip has ended");
                    }
                } else {
                    setClockSimulation("You don't have an active trip!");
                }
            } catch (error) {
                console.log("Error fetching ride data:", error);
                setClockSimulation("An error occurred while fetching the trip data.");
            }
        };


        // Fetch data immediately on mount
        fetchRideData();

        // Set up an interval to fetch data every 1 second
        const intervalId = setInterval(fetchRideData, 1000);

        // Clean up the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, [jwt, apiEndpointForCurrentRide, userId]);

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
                        {isBlocked ? (
                            <p style={{ color: "white", textAlign: "left", fontSize: "20px", display: "flex", alignItems: "center" }}>
                                <FaTimes style={{ marginRight: "10px" }} /> You are blocked
                            </p>
                        ) : (
                            <p style={{ color: "white", textAlign: "left", fontSize: "20px", display: "flex", alignItems: "center" }}>
                                {username}
                                <span style={{ marginLeft: "10px" }}>
                                    {status == 0 && <FaSpinner />}
                                    {status == 1 && <FaCheckCircle />}
                                    {status == 2 && <FaTimes />}
                                </span>
                            </p>
                        )}
                    </div>
    
                    <div>
                        <hr style={{ width: '330px' }}></hr>
                    </div>
                    {clockSimulation == "You don't have an active trip!" ? (
                        <>
                            <button className="button" onClick={handleEditProfile}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <MdPerson size={25} style={{ marginRight: '30px' }} />
                                    <span>Profile</span>
                                </div>
                            </button>
                            {!isBlocked && isVerified === true ? (
                                <>
                                    <button className="button" onClick={handleViewRides}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FaCar size={25} style={{ marginRight: '30px' }} />
                                            <span>New rides</span>
                                        </div>
                                    </button>
                                    <button className="button" onClick={handleDriveHistory}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <FaRoad size={25} style={{ marginRight: '30px' }} />
                                            <span>Rides history</span>
                                        </div>
                                    </button>
                                </>
                            ) : null}
                        </>
                    ) : null}
                    <p style={{ color: 'white', marginTop: '20px', marginLeft: '20px' }}>{clockSimulation}</p>
                </div>
                {!tripIsActive ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '100%', display: 'flex' }}>
                            {view === "editProfile" ? (
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
                                            {!isBlocked && isVerified === true ? (
                                                isEditing ? (
                                                    <div>
                                                        <button className='edit-button' onClick={handleSaveClick}>Save</button>
                                                        <button className='edit-button' onClick={handleCancelClick}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    (clockSimulation === "You don't have an active trip!") ? (
                                                        <div>
                                                            <button className='edit-button' onClick={handleEditClick}>Edit</button>
                                                        </div>
                                                    ) : null
                                                )
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ) : view === 'rides' ? (
                                (clockSimulation === "You don't have an active trip!") ? (
                                    <div className="centered" style={{ width: '100%', height: '10%' }}>
                                        <table className="styled-table" style={{ width: '70%' }}>
                                            <thead>
                                                <tr>
                                                    <th>Location</th>
                                                    <th>Destination</th>
                                                    <th>Price</th>
                                                    <th>Confirmation</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rides.map((val) => (
                                                    <tr key={val.tripId}>
                                                        <td>{val.currentLocation}</td>
                                                        <td>{val.destination}</td>
                                                        <td>{val.price}</td>
                                                        <td>
                                                            <button
                                                                style={{
                                                                    borderRadius: '20px',
                                                                    padding: '5px 10px',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    cursor: 'pointer',
                                                                    outline: 'none',
                                                                    background: 'green'
                                                                }}
                                                                onClick={() => handleAcceptNewDrive(val.tripId)}
                                                            >
                                                                Accept
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : null
                            ) : view === 'driveHistory' ? (
                                <RidesDriver />
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}   
