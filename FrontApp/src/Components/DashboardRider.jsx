import React, { useState, useEffect } from 'react';
import { MdPerson } from 'react-icons/md';
import { FaCar } from 'react-icons/fa';
import { FaRoad } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdConfirmationNumber } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import { makeImage, convertDateTimeToDateOnly, changeUserFields } from '../Services/ProfileService';
import { getUserInfo } from '../Services/ProfileService';
import '../Style/NewDrive.css';
import { getEstimation, AcceptDrive, convertTimeStringToMinutes } from '../Services/Estimation.js';
import { getCurrentRide } from '../Services/RiderService.js';
import RidesRider from './RidesRider.jsx';
import { FaStar } from 'react-icons/fa';
import Rate from './Rate.jsx';
export default function RiderDashboard(props) {
    const user = props.user;

    const jwt = localStorage.getItem('token');
    const navigate = useNavigate();
    const apiEndpoint = process.env.REACT_APP_CHANGE_USER_FIELDS;
    const apiForCurrentUserInfo = process.env.REACT_APP_GET_USER_INFO;


    const apiEndpointEstimation = process.env.REACT_APP_GET_ESTIMATION_PRICE;
    const apiEndpointAcceptDrive = process.env.REACT_APP_ACCEPT_SUGGESTED_DRIVE;
    const apiEndpointForCurrentDrive = process.env.REACT_APP_CURRENT_TRIP;

    const [destination, setDestination] = useState(''); // destination 
    const [currentLocation, setCurrentLocation] = useState(''); // current location
    const [estimation, setEstimation] = useState(''); // price of drive 
    const [isAccepted, setIsAccepted] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [driversArivalSeconds, setDriversArivalSeconds] = useState('');
    const [tripTicketSubmited, setTripTicketSubmited] = useState(false);
    const userId = user.id; // user id 
    localStorage.setItem("userId", userId);

    const [activeTrip, setActiveTrip] = useState();



    const handleEstimationSubmit = async () => {
        try {
            if (destination == '' || currentLocation == '') alert("Please complete form!");
            else {
                const data = await getEstimation(localStorage.getItem('token'), apiEndpointEstimation, currentLocation, destination);
                console.log("This is estimated price and time:", data);

                const roundedPrice = parseFloat(data.price.estimatedPrice).toFixed(2);
                console.log(typeof driversArivalSeconds);
                setDriversArivalSeconds(convertTimeStringToMinutes(data.price.driversArivalSeconds));
                setEstimation(roundedPrice);

            }

        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };

    const handleAcceptDriveSubmit = async () => {
        try {
            const data = await AcceptDrive(apiEndpointAcceptDrive, userId, jwt, currentLocation, destination, estimation, isAccepted, driversArivalSeconds);

            if (data.message && data.message == "Request failed with status code 400") {
                alert("You have already submited tiket!");
                setDriversArivalSeconds('');
                setEstimation('');
                setCurrentLocation('');
                setDestination('');
            }
        } catch (error) {
            console.error("Error when I try to show profile", error);
        }
    };


    const handleLocationChange = (event) => {
        setCurrentLocation(event.target.value);
    };

    const handleDestinationChange = (event) => {
        setDestination(event.target.value);
    };




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
    console.log(view);
    const [isEditing, setIsEditing] = useState(false);

    //pw repeat
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatNewPassword, setRepeatNewPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const [initialUser, setInitialUser] = useState({});
    const [clockSimulation, setClockSimulation] = useState();

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

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
    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleNewDriveClick = () => {
        setView('newDrive');

    }

    const handleEditProfile = () => {
        setView('editProfile');
    }


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

    const handleDriveHistory = () => {
        setView('driveHistory');
    };

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getUserInfo(jwt, apiForCurrentUserInfo, userId);
                const user = userInfo.user;
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

    const handleRateTrips = () =>{
        setView('rateTrips');
    }


    useEffect(() => {
        const fetchRideData = async () => {
            try {
                const data = await getCurrentRide(jwt, apiEndpointForCurrentDrive, userId);
                console.log("Active trip:", data);

                if (data.error && data.error.status === 400) {
                    setClockSimulation("You don't have an active trip!");
                    return;
                }

                if (data.trip) {
                    console.log("Active trip:", data.trip);

                    if (!data.trip.accepted) {
                        setClockSimulation("Your current ticket is not accepted by any driver!");
                    } else if (data.trip.accepted && data.trip.secondsToDriverArrive > 0) {
                        setClockSimulation(`The driver will arrive in: ${data.trip.secondsToDriverArrive} seconds`);
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
    }, [jwt, apiEndpointForCurrentDrive, userId]);

    console.log("This is clock simulation:", clockSimulation);

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
                        <hr style={{ width: '100px' }} />
                    </div>
                    <div>
                        {clockSimulation == "Your current ticket is not accepted by any driver!" || clockSimulation == "You don't have an active trip!" ? (
                            <>
                                <button className="button" onClick={handleEditProfile}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <MdPerson size={25} style={{ marginRight: '30px' }} />
                                        <span>Profile</span>
                                    </div>
                                </button>
                                <button className="button" onClick={handleNewDriveClick}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaCar size={25} style={{ marginRight: '30px' }} />
                                        <span>New drive</span>
                                    </div>
                                </button>
                                <button className="button" onClick={handleDriveHistory}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaRoad size={25} style={{ marginRight: '30px' }} />
                                        <span>Driving history</span>
                                    </div>
                                </button>

                                <button className='button' onClick={handleRateTrips}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FaStar size={25} style={{ marginRight: '30px' }} />
                                        <span>Rate rides</span>
                                    </div>
                                </button>
                            </>
                        ) : null}
                        <p style={{ color: 'white', marginTop: '20px', marginLeft: '20px' }}>{clockSimulation}</p>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '100%', display: 'flex' }}>
                        {view === "editProfile" ? (
                            <div style={{ width: '100%' }}>
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
                                            (clockSimulation === "Your current ticket is not accepted by any driver!" || clockSimulation === "You don't have an active trip!") ? (
                                                <div>
                                                    <button className='edit-button' onClick={handleEditClick}>Edit</button>
                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : view === 'newDrive' ? (
                            <div style={{
                                width: '100%',
                                height: '100vh',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <div className="centered" style={{
                                    width: '60%',
                                    height: '60%',
                                    margin: '50px',
                                    padding: '20px',
                                    backgroundColor: 'black',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    color: 'white'
                                }}>
                                
                                    <div style={{
                                        fontSize: '15px',
                                        textAlign: 'left',
                                        marginLeft:'150'
                                    }}>

                                    </div>
                                    <div style={{
                                        fontSize: '40px',
                                        textAlign: 'left',
                                        marginBottom: '20px',
                                        marginLeft: '150'
                                    }}>
                                        MM Taxi
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter location"
                                        value={currentLocation}
                                        style={{
                                            width: '80%',
                                            margin: '10px 0',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: 'black',
                                            boxShadow: '0 0 0 1px white inset'
                                        }}
                                        onChange={handleLocationChange}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter destination"
                                        value={destination}
                                        style={{
                                            width: '80%',
                                            margin: '10px 0',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: 'black',
                                            boxShadow: '0 0 0 1px white inset'
                                        }}
                                        onChange={handleDestinationChange}
                                    />
                                    <button
                                        style={{
                                            width: '80%',
                                            margin: '10px 0',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: 'white',
                                            color: 'black',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleEstimationSubmit}
                                    >
                                        See Price
                                    </button>
                                    <input
                                        type="text"
                                        value={`Estimated price is: ${estimation}\u20AC`}
                                        style={{
                                            width: '80%',
                                            margin: '10px 0',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: 'black',
                                            boxShadow: '0 0 0 1px white inset'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={`Estimated time of waiting: ${driversArivalSeconds} minute`}
                                        style={{
                                            width: '80%',
                                            margin: '10px 0',
                                            padding: '10px',
                                            borderRadius: '5px',
                                            border: 'none',
                                            backgroundColor: 'black',
                                            boxShadow: '0 0 0 1px white inset'
                                        }}
                                    />
                                    {estimation !== '' && driversArivalSeconds !== '' && (
                                        <button
                                            style={{
                                                width: '80%',
                                                margin: '10px 0',
                                                padding: '10px',
                                                borderRadius: '5px',
                                                border: 'none',
                                                backgroundColor: 'white',
                                                color: 'black',
                                                cursor: 'pointer'
                                            }}
                                            onClick={handleAcceptDriveSubmit}
                                        >
                                            Accept
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : view === 'driveHistory' ? (
                            <RidesRider />
                        ) : view=="rateTrips"? (
                            <Rate/>
                            ): null}
                    </div>
                </div>
            </div>
        </div>
    );
}    
