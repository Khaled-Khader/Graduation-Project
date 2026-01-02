
const BASE_URL = "http://localhost:8080";


export async function CheckIfTokenValidOrExist() {
    const response = await fetch(`${BASE_URL}/users/auth`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to check auth");
    }

    const userData = await response.json();
    return userData; 
}

export async function FetchPets(userId) {
    
    const response=await fetch(`${BASE_URL}/pet/${userId}`,{
        method:"GET",
        credentials:"include"
    })

    if(!response.ok){
        throw new Error("Failed to fetch")
    }

    const userData=await response.json()
    return userData
}

export async function LoginFetchData({ email, password }) {
    const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        credentials: "include",
        cache: "no-store", 
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        email: email,
        passwordHash: password,
        }),
    });

    return response;
}

export async function LogoutFetchData(){
    const response =await fetch(`${BASE_URL}/users/logout`,{
        credentials:"include",
        method:"POST"
    })

    
    return response
}

export async function addPet(data) {
    return fetch(`${BASE_URL}/pet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
}

export async function addService(data) {
    return fetch(`${BASE_URL}/service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
}


export async function deletePet(petId) {
    const res = await fetch(`${BASE_URL}/pet/${petId}`, {
        method: "DELETE",
        credentials: "include", 
        headers: {
        "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete pet");
    }

    return true;
}

// services/http.js



export async function deleteService(serviceId) {
    const res = await fetch(`${BASE_URL}/service/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
        "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete service");
    }

    return true;
}

export async function patchProfile(data) {
    const res = await fetch(`${BASE_URL}/user-profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
}


