import storage from '@react-native-firebase/storage';

export const uploadImage = async (path) => {
    try{
        const imageurl = await storage().ref(path).getDownloadURL();
        return imageurl;
    }   catch(error){
        console.error("Error fetching img from firebase",error);
        return null;
    }
}