import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCnAQFwI0uO_REbJpqPKPJz28uquBI3gLA",
  authDomain: "jaydosa-494013.firebaseapp.com",
  projectId: "jaydosa-494013",
  storageBucket: "jaydosa-494013.firebasestorage.app",
  messagingSenderId: "207328670577",
  appId: "1:207328670577:web:0d37f605dda651145a3cd0",
  measurementId: "G-MDXZ7K3279"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Analytics (only in client-side)
export const initAnalytics = async () => {
  if (typeof window !== "undefined" && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

export { app };
