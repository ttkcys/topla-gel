
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase"; // You'll need to initialize Firebase app first

const provider = new GoogleAuthProvider();

// Configure the Google provider if needed
provider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithGoogle = async () => {
  try {
    const auth = getAuth(app);
    const result = await signInWithPopup(auth, provider);

    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;

    // The signed-in user info
    const user = result.user;

    return user;
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);

    throw error;
  }
};

// You might also want to add these utility functions
export const signOutUser = async () => {
  const auth = getAuth(app);
  await auth.signOut();
};

export const getCurrentUser = () => {
  const auth = getAuth(app);
  return auth.currentUser;
};
