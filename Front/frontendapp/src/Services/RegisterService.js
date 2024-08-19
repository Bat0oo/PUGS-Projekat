import axios from "axios";
import { SHA256 } from 'crypto-js';

// Function to validate fields and show alerts
export function DropErrorForField(firstNameError, lastNameError, birthdayError, addressError, usernameError, emailError, passwordError, repeatPasswordError, imageUrlError) {
    let isValid = true;

    if (firstNameError) {
        alert("First Name is required");
        isValid = false;
    } else if (lastNameError) {
        alert("Last Name is required");
        isValid = false;
    } else if (birthdayError) {
        alert("You must be older than 18");
        isValid = false;
    } else if (addressError) {
        alert("Address is required");
        isValid = false;
    } else if (usernameError) {
        alert("Username is required");
        isValid = false;
    } else if (emailError) {
        alert("This is not a valid email!");
        isValid = false;
    } else if (passwordError || repeatPasswordError) {
        alert("Passwords do NOT match!");
        isValid = false;
    } else if (imageUrlError) {
        alert("Image is required");
        isValid = false;
    }

    return isValid;
}

// Function to handle API call and errors
export async function RegularRegisterApiCall(
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
    apiEndpoint
) {
    const isCompleted = DropErrorForField(
        firstNameError,
        lastNameError,
        birthdayError,
        addressError,
        usernameError,
        emailError,
        passwordError,
        repeatPasswordError,
        imageUrlError
    );

    if (isCompleted) {
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('birthday', birthday);
        formData.append('address', address);
        formData.append('email', email);
        const hashedPassword = SHA256(password).toString();
        formData.append('password', hashedPassword);
        formData.append('typeOfUser', typeOfUser);
        formData.append('username', username);
        formData.append('imageUrl', imageUrl);

        // Validate password confirmation
        if (hashedPassword === SHA256(repeatPassword).toString()) {
            try {
                const response = await axios.post(apiEndpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log("Registration successful:", response.data);
                return true;
            } catch (error) {
                if (error.response) {
                    // Handle server errors
                    if (error.response.status === 409) {
                        alert(error.response.data + "\nTry another email!!!");
                    } else {
                        alert("An error occurred: " + error.response.data.message || "Please try again.");
                    }
                } else if (error.request) {
                    // Handle network errors
                    alert("Network error: " + error.request);
                } else {
                    // Handle unknown errors
                    alert("Error: " + error.message);
                }
                console.error("Error config:", error.config);
            }
        } else {
            alert("Passwords do not match!");
        }
    }
}
