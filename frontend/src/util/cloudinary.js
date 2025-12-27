    
    export async function uploadImageToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "petnexus_upload");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/di1xpud7d/image/upload",
        {
        method: "POST",
        body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url; // ✅ THIS IS THE IMAGE URL
    }
