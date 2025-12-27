


export async function CheckIfTokenValidOrExist() {
    const response = await fetch("http://localhost:8080/users/auth", {
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
    
    const response=await fetch(`http://localhost:8080/pet/${userId}`,{
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
    const response = await fetch("http://localhost:8080/users/login", {
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
    const response =await fetch("http://localhost:8080/users/logout",{
        credentials:"include",
        method:"POST"
    })

    
    return response
}

export async function addPet(data) {
    return fetch("http://localhost:8080/pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
}

export async function addService(data) {
    return fetch("http://localhost:8080/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
}

