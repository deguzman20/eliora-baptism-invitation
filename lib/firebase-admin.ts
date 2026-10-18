import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = "eliora-faye-christining";
const clientEmail =
  "firebase-adminsdk-fbsvc@eliora-faye-christining.iam.gserviceaccount.com";
const privateKey =
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDkpbUwCSy09nUb\naXgBV6yiEjT71iDi8NHOJzOsBeRHZ65VxUXXxojUBTdUNkPIBHEUy5p9QwLa7y23\nu2i8OyxNnpUicxucaOgSj3NyCCkCdBboj79gg6ykTeIF9Uc9QKqIvStzzRb97NI5\niBLfudJ84WMgCrnV1IkEQfBdZFfPy9ar2LDgBUxy6qxIAj3oNWhQ58rMNXhCToHH\nhPwFd4YIxYa1Dnkwyu3AMvm2XQZoMePrA8xfHd/QvtXjyOfg6KRuGdN0rNb/Ti67\nnKcy9MJyqVeur+4qGBKxW7KtJ5v2ixJbg7xGKgfyrY6RWwezAokYOfOpATKJXQ6m\nzMzEF+aFAgMBAAECggEAKLr2IFT6EFB5AwWSOZb/Ky3YH2aBHDwu+6zTERlJlYi8\nLw5Bx1LYDADT3t39zBMye7RbVGYMC6kguUKawTE/TqJpyaW8rOupL6k7NPyMJaI9\ndHcq7cv3BJvVIB+V7azn1AzywSGvL1OxDUuWpSEKhHF4AXy3pwZB1C7U3SYjWGIO\njI8tRFWdsOJ3VBE9TfoLFte+C5EKazyRzn8ANF+zHbBRZm4oOrJpO6Iedc+JtYdW\nhI1nrz9HH9YzeioGSiLnHN6wKt3df+eleKchSWDOM7J9SU/NAjX9+6fw7kZJGed3\nZT6gUSy4I3VPcckSnVDH5xNElz/8/bz1RMK9/k3oXwKBgQD/YJ3lNy5e+odoyL5v\nc65W8VVKmDJ4Te8wl9GbaZlr7fDFONdZiKQjhEf+jYj2SkCdP7qT8/Rvt1TdzuRa\nUD23IDQ7+2KTOySiv4w76m0Twqs+D8lMUrX9CCuytll+6p0Sl4FbxHZlxMiy0l9v\nlgwiiSnHzTvD85b4yRb/vGzHawKBgQDlNGiTB6X+kv58/fE0u/Y7KO5ZZ9CnNJEz\n4485dXwHU2g4djpJ7TBtzlXVt/9Ian4Y9lkDsGaZKD2+fYXYrSi5JGnGDxSZOak3\nEoQt1F0bbdTJr6FSQL9we+WHrvxaBkrsh7IKumg0b5/rIGMefb6fIvb2Fx4z5oDY\n4Q3Qmmy1zwKBgQCEjMFnl5yZ768Y1BkEACcdOWXrsdOAXfMoZaSF5emb+4Rc2YPt\nFN8dECvOE+hi7WdcNxfAc38L/TwvZJNhzQQ7aJu0BmbDxI7fakx/TM4Q05nOPKNe\n2g9bpkIIIF2TYnLkk36xAufxKpKBPnAKmvbxdgAZlIzQyD40Iyus0UAkwQKBgBW9\nSs3nQ89Jkem5DE+8JDaoQzMnrZquWbdaNhN1GTZ4qsHwNMceQCGqGGoU8ZmkwCEN\n/JNk/9Y3AuQ2c6OBiQNGeOHYPFPsLCiVEQRnyAz59dzLU7nBembo2XRtHHJNdn3I\nwRJTa97NV5WtlLknpBTj9BiTSMITctUfQ3gtrXHxAoGAVf9nu7BJt4J+ln3DU45W\nuqq5WMuUMBFzJ7W+AY/fwfWhQSMN2TepwMadzBbPinD84nmTvhffY4NcZLUNzPzN\nXLfmgR1icPFYiHfdfXzboK7SXPeUgolzsBJQBXPbof+GN5Oc0FtoYMT+XNW7mcXP\n7AfFg8f+lIuV8qexquBP6yI=\n-----END PRIVATE KEY-----\n"?.replace(
    /\\n/g,
    "\n"
  );

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing Firebase Admin credentials. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
  );
}

const adminApp =
  getApps().find((app) => app.name === "eliora-admin") ??
  initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    "eliora-admin"
  );

export const adminDb = getFirestore(adminApp);
