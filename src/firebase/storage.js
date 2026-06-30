import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMockFirebase } from './firebaseConfig';

export const uploadProductImage = async (file) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  } else {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `products/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  }
};

export const uploadPrescriptionImage = async (file) => {
  if (isMockFirebase) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  } else {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `prescriptions/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  }
};
