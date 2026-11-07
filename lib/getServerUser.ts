import { adminAuth } from "./firebaseAdmin";

export async function getServerUser(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify the Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (!decodedToken) {
      return null;
    }

    return {
      id: decodedToken.uid,
      email: decodedToken.email || null,
    };
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return null;
  }
}
