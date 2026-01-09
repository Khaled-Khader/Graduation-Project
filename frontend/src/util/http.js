
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

export async function http(url, options = {}) {
    const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
        "Content-Type": "application/json",
        },
        credentials: "include",
        ...options,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Request failed");
    }

    return response.json();
}

export async function createRegularPost({ content, imageUrl }) {
    const response = await fetch(`${BASE_URL}/post/regular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, imageUrl }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create post");
    }

  return response.json(); // returns RegularPostDTO
}

export async function createAdoptionPost({ content, petId, city }) {
    const response = await fetch(`${BASE_URL}/post/adoption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, petId, city }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create adoption post");
    }

  return response.json(); // returns AdoptionPostDTO
}


export async function fetchComments(postId, { pageParam = 0, size = 10 } = {}) {
    const params = new URLSearchParams({
        page: pageParam,
        size,
    });

    const response = await fetch(`${BASE_URL}/comment/post/${postId}?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch comments");
    }

  return response.json(); // returns Page<CommentResponseDTO>
}


export async function addComment(postId, content) {
    const response = await fetch(`${BASE_URL}/comment/post/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to add comment");
    }

    return true;
}


export async function createAdoptionRequest({ postId, phoneNumber, city, message }) {
    const response = await fetch(`${BASE_URL}/adoption-requests/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber, city, message }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to send adoption request");
    }
}

export async function cancelAdoptionPost(postId){
    const response=await fetch(`${BASE_URL}/adoption-requests/post/${postId}/cancel` ,{
        method:"PUT",
        credentials:"include"
    })
    if(!response.ok){
        const text=await response.text()
        throw new Error(text || "Failed to cancel adoption")
    }
    return response
}

export async function FetchAdoptionPostsForuser() {
    const response=await fetch(`${BASE_URL}/post/user/adoption`,{
        method:"GET",
        credentials:"include"
    })

    if(!response.ok){
        const text= await response.text()
        throw new Error(text || "Something went wrong")
    }
        const data=await response.json()
        return data
}

export async function FetchRequsetOnAdoptionPost(
    postId,
    page = 0,
    size = 10
    ) {
    const response = await fetch(
        `${BASE_URL}/adoption-requests/post/${postId}?page=${page}&size=${size}`,
        {
        method: "GET",
        credentials: "include",
        }
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Something went wrong");
    }

    return response.json(); 
}


export async function AcceptRequsetForAdoptionPost(requsetId){
    const response = await fetch(`${BASE_URL}/adoption-requests/${requsetId}/accept`,
        {
            method:"PUT",
            credentials:"include"
        }
    )

    if(!response.ok){
        const text= await response.text()
        throw new Error(text || "Failed to accept")
    }

    return true
}

export async function CompleteAdoptionPost(postId){

    const response= await fetch(`${BASE_URL}/adoption-requests/post/${postId}/complete`,
        {
            method:"PUT",
            credentials:"include"
        }
    )

    if(!response.ok){
        const text= await response.text()
        throw new Error(text || "Failed to accept")
    }

    return true
}



