import React from 'react';
export default function EditProfile({ 
    imageFile, 
    isEditing, 
    handleImageChange, 
    username, 
    setUsername, 
    firstName, 
    setFirstName, 
    lastName, 
    setLastName, 
    address, 
    setAddress, 
    birthday, 
    setBirthday, 
    email, 
    setEmail, 
    oldPassword, 
    setOldPassword, 
    newPassword, 
    setNewPassword, 
    repeatNewPassword, 
    setRepeatNewPassword, 
    handleSaveClick, 
    handleCancelClick, 
    handleEditClick 
}) {    
    return (
        <div style={{ 
            width: '100vw', // Ensure full screen width
            height: '100vh', // Ensure full screen height
            margin: 0, // Remove margin
            padding: 0, // Remove padding
            backgroundColor: 'transparent',
            display: 'flex', // Optional: If you want to center your content vertically and horizontally
            justifyContent: 'center', // Center content horizontally
            alignItems: 'center' // Center content vertically
        }}>
<div style={{ width: '100%', backgroundColor: 'transparent' }}>
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
        </div>
    );
}



