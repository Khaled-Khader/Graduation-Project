const BASE_URL = import.meta.env.VITE_API_URL;

export async function uploadImageToCloudinary(file, folder = "petnexus/uploads") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(`${BASE_URL}/images/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.imageUrl;
}
