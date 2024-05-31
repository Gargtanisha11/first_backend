const getPublicIdFromCloudinaryUrl=(fileUrl)=>{
    
        const urlSegments = fileUrl.split('/');
        const publicIdWithExtension = urlSegments.slice(6).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        return publicId;
      
}


export {getPublicIdFromCloudinaryUrl}