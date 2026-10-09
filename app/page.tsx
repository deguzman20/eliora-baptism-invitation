"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Camera,
  Download,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Church,
  Clock3,
  Heart,
  MapPin,
  MessageCircleHeart,
  PartyPopper,
  RotateCcw,
  Send,
  Shirt,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =========================================================
   EVENT DATA
========================================================= */

const EVENT_DATE = "2026-11-22T10:30:00";

const EVENT = {
  child: "Eliora Faye De Guzman",
  shortName: "Eliora Faye",
  date: "Sunday, November 22, 2026",
  time: "10:30 AM",
  church: "Saint Francis of Assisi and Santa Quiteria Parish Church",
  churchSubtitle: "(Diocese of Kalookan)",
  reception: "Savory SM North Edsa Annex",
  parents: {
    father: "Alejandro De Guzman",
    mother: "Joyvy De Guzman",
  },
};

/* =========================================================
   TYPES
========================================================= */

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type GuestEntry = {
  id: string;
  name: string;
  message: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | null;
};

type ReservationErrors = {
  name: string;
  attendance: string;
  guests: string;
  message: string;
};

type ReservationEntry = {
  id: string;
  name: string;
  attendance: "yes" | "no";
  guests?: number;
  message?: string;
  createdAt?: {
    seconds?: number;
    nanoseconds?: number;
  } | null;
};

type GalleryImage = {
  src: string;
  title: string;
};

type PhotoTemplate = {
  id: string;
  name: string;
  subtitle: string;
  slots: 1 | 2 | 3 | 4;
  accent: string;
  background: string;
  border: string;
  message: string;
  style: "single" | "duo" | "trio" | "grid" | "masonry" | "portrait";
  theme: "eucalyptus" | "blush";
};

/* =========================================================
   DATA
========================================================= */

const GODPARENTS = [
  "Ryan Bulot",
  "Sieder Villareal",
  "Maximiano Consul Jr.",
  "Lorenz Pascual",
  "Jasmine Chavez",
  "Dwight Yanela",
  "Jesselle Caras",
  "Arvie Gacuma",
];

const GALLERY: GalleryImage[] = [
  {
    src: "/eliora-faye.jpeg",
    title: "A little blessing",
  },
  {
    src: "/eliora-faye.jpeg",
    title: "Sweet little Eliora",
  },
  {
    src: "/eliora-faye.jpeg",
    title: "Loved beyond measure",
  },
  {
    src: "/eliora-faye.jpeg",
    title: "A beautiful little moment",
  },
  {
    src: "/eliora-faye.jpeg",
    title: "Our precious blessing",
  },
  {
    src: "/eliora-faye.jpeg",
    title: "Surrounded by love",
  },
];

const PHOTO_TEMPLATES: PhotoTemplate[] = [
  {
    id: "rose-portrait",
    name: "Rose Portrait",
    subtitle: "1 photo",
    slots: 1,
    accent: "#b85c7b",
    background: "#fff7fa",
    border: "#e8b5c5",
    message: "A little blessing",
    style: "single",
    theme: "eucalyptus",
  },
  {
    id: "sweet-duo",
    name: "Sweet Duo",
    subtitle: "2 photos",
    slots: 2,
    accent: "#a45d77",
    background: "#fff6f8",
    border: "#e8b6c5",
    message: "Two little moments",
    style: "duo",
    theme: "blush",
  },
  {
    id: "trinity",
    name: "Trinity",
    subtitle: "3 photos",
    slots: 3,
    accent: "#a45d77",
    background: "#fff0f4",
    border: "#e8b6c5",
    message: "Faith • Love • Joy",
    style: "trio",
    theme: "eucalyptus",
  },
  {
    id: "kikay-four",
    name: "Kikay Four",
    subtitle: "4 photos",
    slots: 4,
    accent: "#b85c7b",
    background: "#ffeaf2",
    border: "#e7a8bb",
    message: "Eliora Faye ♡",
    style: "grid",
    theme: "blush",
  },
  {
    id: "bloom-masonry",
    name: "Bloom Masonry",
    subtitle: "4 photos",
    slots: 4,
    accent: "#a45d77",
    background: "#fff6f8",
    border: "#e8b6c5",
    message: "Loved beyond measure",
    style: "masonry",
    theme: "eucalyptus",
  },
  {
    id: "eliora-keepsake",
    name: "Eliora Keepsake",
    subtitle: "1 photo",
    slots: 1,
    accent: "#8f5269",
    background: "#fff6f8",
    border: "#dcb1bf",
    message: "November 22, 2026",
    style: "portrait",
    theme: "blush",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getTimeLeft(): TimeLeft {
  const difference = new Date(EVENT_DATE).getTime() - new Date().getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function formatGuestDate(
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | null
) {
  if (!createdAt) return "";

  return new Date(createdAt.seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Home() {
  /* -------------------------------------------------------
     OPENING
  ------------------------------------------------------- */

  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  /* -------------------------------------------------------
     MUSIC
  ------------------------------------------------------- */

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  /* -------------------------------------------------------
     COUNTDOWN
  ------------------------------------------------------- */

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());

  /* -------------------------------------------------------
     GALLERY
  ------------------------------------------------------- */

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  /* -------------------------------------------------------
     GUESTBOOK
  ------------------------------------------------------- */

  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([]);
  const [guestNotesPage, setGuestNotesPage] = useState(1);
  const GUEST_NOTES_PER_PAGE = 6;

  const [isSubmittingGuestbook, setIsSubmittingGuestbook] = useState(false);

  const [guestErrors, setGuestErrors] = useState({
    name: "",
    message: "",
  });

  /* -------------------------------------------------------
     RESERVATION
  ------------------------------------------------------- */

  const [reservationName, setReservationName] = useState("");

  const [reservationAttendance, setReservationAttendance] = useState<
    "yes" | "no" | ""
  >("");

  const [reservationGuests, setReservationGuests] = useState("1");

  const [reservationMessage, setReservationMessage] = useState("");

  const [reservationErrors, setReservationErrors] = useState<ReservationErrors>(
    {
      name: "",
      attendance: "",
      guests: "",
      message: "",
    }
  );

  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);

  const [reservationSuccess, setReservationSuccess] = useState(false);

  const [reservationSubmitError, setReservationSubmitError] = useState("");
  const [reservationEntries, setReservationEntries] = useState<
    ReservationEntry[]
  >([]);
  const [reservationListError, setReservationListError] = useState("");

  /* -------------------------------------------------------
     SCROLL
  ------------------------------------------------------- */

  const { scrollYProgress } = useScroll();

  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  /*
   * IMPORTANT:
   * No target ref here.
   *
   * This prevents:
   * "Target ref is defined but not hydrated"
   *
   * The parallax now uses the page scroll progress.
   */

  const heroImageY = useTransform(scrollYProgress, [0, 0.35], ["0%", "18%"]);

  const heroImageScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.12]);

  /* =========================================================
     COUNTDOWN
  ========================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================================================
     FIREBASE GUESTBOOK
  ========================================================= */

  useEffect(() => {
    const guestMessagesRef = collection(db, "guestMessages");

    const guestQuery = query(guestMessagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      guestQuery,
      (snapshot) => {
        const entries: GuestEntry[] = snapshot.docs.map((document) => ({
          id: document.id,
          ...(document.data() as Omit<GuestEntry, "id">),
        }));

        setGuestEntries(entries);
      },
      (error) => {
        console.error("REALTIME GUESTBOOK ERROR:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  /* =========================================================
     FIREBASE RESERVATIONS — LIVE LIST AND COUNTS
  ========================================================= */

  useEffect(() => {
    const reservationsRef = collection(db, "reservations");
    const reservationsQuery = query(
      reservationsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        const entries: ReservationEntry[] = snapshot.docs.map((document) => {
          const data = document.data();
          return {
            id: document.id,
            name: typeof data.name === "string" ? data.name : "Guest",
            attendance: data.attendance === "no" ? "no" : "yes",
            guests: typeof data.guests === "number" ? data.guests : 0,
            message: typeof data.message === "string" ? data.message : "",
            createdAt: data.createdAt ?? null,
          };
        });

        setReservationEntries(entries);
        setReservationListError("");
      },
      (error) => {
        console.error("REALTIME RESERVATIONS ERROR:", error);
        setReservationListError(
          "We couldn't load the reservation list. Check your Firestore read permissions."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const reservationStats = useMemo(() => {
    const attending = reservationEntries.filter(
      (entry) => entry.attendance === "yes"
    );
    const notAttending = reservationEntries.filter(
      (entry) => entry.attendance === "no"
    );

    return {
      totalReservations: reservationEntries.length,
      attendingReservations: attending.length,
      notAttendingReservations: notAttending.length,
      totalAttendingGuests: attending.reduce(
        (total, entry) => total + Math.max(0, Number(entry.guests) || 0),
        0
      ),
    };
  }, [reservationEntries]);

  /* =========================================================
     MUSIC
  ========================================================= */

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      }
    } catch (error) {
      console.error("MUSIC ERROR:", error);
    }
  };

  /* =========================================================
     ENVELOPE
  ========================================================= */

  const openInvitation = async () => {
    if (isOpening || opened) return;

    setIsOpening(true);

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      } catch {
        // Browser autoplay restriction.
      }
    }

    setTimeout(() => {
      setOpened(true);
      setIsOpening(false);
    }, 1500);
  };

  /* =========================================================
     GUESTBOOK VALIDATION
  ========================================================= */

  const validateGuestbook = () => {
    const errors = {
      name: "",
      message: "",
    };

    const name = guestName.trim();
    const message = guestMessage.trim();

    if (!name) {
      errors.name = "Please enter your name.";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (name.length > 80) {
      errors.name = "Name must be 80 characters or less.";
    }

    if (!message) {
      errors.message = "Please write a message.";
    } else if (message.length < 3) {
      errors.message = "Message must be at least 3 characters.";
    } else if (message.length > 500) {
      errors.message = "Message must be 500 characters or less.";
    }

    setGuestErrors(errors);

    return !errors.name && !errors.message;
  };

  /* =========================================================
     GUESTBOOK SUBMIT
  ========================================================= */

  const handleGuestbookSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateGuestbook()) return;

    setIsSubmittingGuestbook(true);

    try {
      await addDoc(collection(db, "guestMessages"), {
        name: guestName.trim(),
        message: guestMessage.trim(),
        createdAt: serverTimestamp(),
      });

      setGuestName("");
      setGuestMessage("");

      setGuestErrors({
        name: "",
        message: "",
      });
    } catch (error) {
      console.error("GUESTBOOK SUBMIT ERROR:", error);
    } finally {
      setIsSubmittingGuestbook(false);
    }
  };

  /* =========================================================
     RESERVATION VALIDATION
  ========================================================= */

  const validateReservation = () => {
    const errors: ReservationErrors = {
      name: "",
      attendance: "",
      guests: "",
      message: "",
    };

    const name = reservationName.trim();
    const message = reservationMessage.trim();

    if (!name) {
      errors.name = "Please enter your name.";
    } else if (name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (name.length > 80) {
      errors.name = "Name must be 80 characters or less.";
    }

    if (!reservationAttendance) {
      errors.attendance = "Please select your attendance.";
    }

    if (reservationAttendance === "yes") {
      const guests = Number(reservationGuests);

      if (!reservationGuests) {
        errors.guests = "Please enter the number of guests.";
      } else if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
        errors.guests = "Guests must be between 1 and 20.";
      }
    }

    if (message.length > 300) {
      errors.message = "Message must be 300 characters or less.";
    }

    setReservationErrors(errors);

    return !Object.values(errors).some(Boolean);
  };

  /* =========================================================
     RESERVATION SUBMIT
  ========================================================= */
  const handleReservationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setReservationSubmitError("");

    const isValid = validateReservation();

    if (!isValid) return;

    setIsSubmittingReservation(true);

    try {
      const guestCount =
        reservationAttendance === "yes" ? Number(reservationGuests) : 0;

      const reservationData = {
        name: reservationName.trim(),
        attendance: reservationAttendance,
        guests: guestCount,
        message: reservationMessage.trim(),
        createdAt: serverTimestamp(),
      };

      console.log("Saving reservation:", reservationData);

      const docRef = await addDoc(
        collection(db, "reservations"),
        reservationData
      );

      console.log("RESERVATION SAVED:", docRef.id);

      // SUCCESS
      setReservationSuccess(true);

      // RESET FORM
      setReservationName("");
      setReservationAttendance("");
      setReservationGuests("1");
      setReservationMessage("");

      setReservationErrors({
        name: "",
        attendance: "",
        guests: "",
        message: "",
      });
    } catch (error: unknown) {
      console.error("RESERVATION SUBMIT ERROR:", error);

      if (error instanceof Error) {
        setReservationSubmitError(`Reservation failed: ${error.message}`);
      } else {
        setReservationSubmitError(
          "Reservation failed. Please check your Firebase Firestore Rules."
        );
      }
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  /* =========================================================
     CALENDAR
  ========================================================= */

  const addToCalendar = () => {
    const start = "20261122T103000";
    const end = "20261122T130000";

    const calendarData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      "SUMMARY:Eliora Faye's Baptism",
      `LOCATION:${EVENT.church}`,
      "DESCRIPTION:Eliora Faye De Guzman's Baptism",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([calendarData], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "eliora-faye-baptism.ics";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     GALLERY
  ========================================================= */

  const nextImage = () => {
    if (selectedImage === null) return;

    setSelectedImage((selectedImage + 1) % GALLERY.length);
  };

  const previousImage = () => {
    if (selectedImage === null) return;

    setSelectedImage((selectedImage - 1 + GALLERY.length) % GALLERY.length);
  };

  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [selectedImage]);

  /* =========================================================
     DISPLAYED GUESTS
  ========================================================= */

  const totalGuestNotesPages = Math.max(
    1,
    Math.ceil(guestEntries.length / GUEST_NOTES_PER_PAGE)
  );

  const displayedGuests = useMemo(() => {
    const start = (guestNotesPage - 1) * GUEST_NOTES_PER_PAGE;
    return guestEntries.slice(start, start + GUEST_NOTES_PER_PAGE);
  }, [guestEntries, guestNotesPage]);

  useEffect(() => {
    if (guestNotesPage > totalGuestNotesPages) {
      setGuestNotesPage(totalGuestNotesPages);
    }
  }, [guestNotesPage, totalGuestNotesPages]);

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffaf8] text-[#71495a]">
      {/* AUDIO */}

      <audio ref={audioRef} src="/baptism-music.mp3" loop preload="auto" />

      {/* SCROLL PROGRESS */}

      {opened && (
        <motion.div
          className="fixed left-0 top-0 z-[100] h-[3px] w-full origin-left bg-[#b85c7b]"
          style={{
            scaleX: progressScaleX,
          }}
        />
      )}

      {/* MUSIC BUTTON */}

      {opened && (
        <motion.button
          initial={{
            opacity: 0,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          onClick={toggleMusic}
          aria-label="Toggle music"
          className="fixed bottom-5 right-5 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/80 text-[#b85c7b] shadow-xl backdrop-blur-md"
        >
          {isMusicPlaying ? <Volume2 size={19} /> : <VolumeX size={19} />}

          {isMusicPlaying && (
            <motion.span
              className="absolute inset-0 rounded-full border border-[#b85c7b]/30"
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.8, 0, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>
      )}

      {/* =====================================================
          ENVELOPE
      ===================================================== */}

      <AnimatePresence>
        {!opened && (
          <motion.section
            exit={{
              opacity: 0,
              scale: 1.05,
              transition: {
                duration: 0.8,
              },
            }}
            className="fixed inset-0 z-[80] flex min-h-screen items-center justify-center overflow-hidden bg-[#fff5f7] px-6"
          >
            <FloatingDecor />

            <div className="relative z-10 w-full max-w-md [perspective:1200px]">
              <motion.div
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                }}
                className="text-center"
              >
                <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#b9788d]">
                  A little blessing
                </p>

                <h1 className="font-serif text-3xl text-[#8f5269]">
                  You&apos;re Invited
                </h1>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#9c7483]">
                  Join us as we celebrate a beautiful milestone in the life of
                  <span className="font-semibold text-[#8f5269]">
                    {" "}
                    Eliora Faye.
                  </span>
                </p>
              </motion.div>

              <motion.div
                className="relative mx-auto mt-10 h-[270px] w-full max-w-[370px]"
                animate={
                  isOpening
                    ? {
                        y: 25,
                        scale: 0.96,
                      }
                    : {
                        y: [0, -5, 0],
                      }
                }
                transition={
                  isOpening
                    ? {
                        duration: 1.2,
                      }
                    : {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                {/* LETTER */}

                <motion.div
                  initial={{
                    y: 30,
                    opacity: 0.8,
                  }}
                  animate={
                    isOpening
                      ? {
                          y: -120,
                          opacity: 1,
                          rotate: -1,
                        }
                      : {
                          y: 15,
                          opacity: 1,
                        }
                  }
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute left-[7%] top-[30px] z-10 h-[190px] w-[86%] rounded-xl bg-[#fffdfb] p-6 shadow-lg"
                >
                  <div className="flex h-full flex-col items-center justify-center border border-[#f2d8df]">
                    <Sparkles size={20} className="mb-3 text-[#c9899f]" />

                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#b9788d]">
                      Baptism Celebration
                    </p>

                    <h2 className="mt-3 font-serif text-2xl text-[#8f5269]">
                      Eliora Faye
                    </h2>

                    <p className="mt-2 text-xs text-[#aa7d8c]">
                      November 22, 2026
                    </p>
                  </div>
                </motion.div>

                {/* ENVELOPE */}

                <div className="absolute bottom-0 left-0 z-20 h-[190px] w-full overflow-hidden rounded-xl bg-[#f7dbe5] shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fce7ee] to-[#f2ccd9]" />

                  <div className="absolute bottom-0 left-0 h-0 w-0 border-b-[190px] border-l-[185px] border-b-[#f5d3df] border-l-transparent" />

                  <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[190px] border-r-[185px] border-b-[#efc6d4] border-r-transparent" />

                  {/* FLAP */}

                  <motion.div
                    animate={
                      isOpening
                        ? {
                            rotateX: -180,
                          }
                        : {
                            rotateX: 0,
                          }
                    }
                    transition={{
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      transformOrigin: "top center",
                    }}
                    className="absolute left-0 top-0 z-30 h-0 w-0 border-l-[185px] border-r-[185px] border-t-[105px] border-l-transparent border-r-transparent border-t-[#f3cfdb]"
                  />

                  {/* SEAL */}

                  <motion.div
                    animate={
                      isOpening
                        ? {
                            opacity: 0,
                            scale: 0.5,
                          }
                        : {
                            opacity: 1,
                            scale: 1,
                          }
                    }
                    transition={{
                      duration: 0.5,
                    }}
                    className="absolute left-1/2 top-[73px] z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#fff0f4] bg-[#b85c7b] shadow-lg"
                  >
                    <Heart
                      size={20}
                      fill="currentColor"
                      className="text-white"
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={openInvitation}
                disabled={isOpening}
                className="mx-auto mt-9 flex items-center gap-2 rounded-full bg-[#b85c7b] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20"
              >
                {isOpening ? "Opening..." : "Open Invitation"}

                <ArrowDown size={16} />
              </motion.button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* =====================================================
          INVITATION
      ===================================================== */}

      {opened && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.8,
          }}
        >
          {/* HERO */}

          <section className="relative min-h-screen overflow-hidden bg-[#fff5f7]">
            <FloatingDecor />

            <div className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-24">
              <div className="grid w-full items-center gap-14 md:grid-cols-2">
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -30,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.9,
                  }}
                  className="text-center md:text-left"
                >
                  <p className="text-xs uppercase tracking-[0.4em] text-[#b9788d]">
                    A day filled with love
                  </p>

                  <h1 className="mt-5 font-serif text-6xl leading-none text-[#8f5269] md:text-8xl">
                    Eliora
                    <span className="block text-[#b85c7b]">Faye</span>
                  </h1>

                  <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-[#9c7483] md:mx-0">
                    With hearts full of gratitude, we invite you to celebrate
                    the baptism of our precious little blessing.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                    <InfoPill
                      icon={<CalendarDays size={15} />}
                      text="November 22, 2026"
                    />

                    <InfoPill icon={<Clock3 size={15} />} text="10:30 AM" />
                  </div>

                  <div className="mt-10 flex justify-center md:justify-start">
                    <a
                      href="#story"
                      className="flex items-center gap-2 text-sm text-[#b85c7b]"
                    >
                      Discover her story
                      <ArrowDown size={16} />
                    </a>
                  </div>
                </motion.div>

                <div className="relative mx-auto w-full max-w-[430px]">
                  <motion.div
                    style={{
                      y: heroImageY,
                      scale: heroImageScale,
                    }}
                    className="relative z-10 overflow-hidden rounded-[45%_45%_12%_12%] border-[10px] border-white bg-white shadow-2xl"
                  >
                    <img
                      src="/eliora-faye.jpeg"
                      alt="Eliora Faye"
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: [0, 4, 0, -4, 0],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                    }}
                    className="absolute -bottom-6 -left-7 z-20 flex h-24 w-24 items-center justify-center rounded-full border border-[#edc9d5] bg-white/80 p-4 text-center font-serif text-sm text-[#b85c7b] shadow-lg backdrop-blur"
                  >
                    A little
                    <br />
                    blessing
                  </motion.div>

                  <Sparkle className="absolute -right-6 top-8" size={34} />

                  <Sparkle className="absolute -bottom-2 right-10" size={22} />
                </div>
              </div>
            </div>
          </section>

          {/* STORY */}

          <section
            id="story"
            className="relative overflow-hidden bg-[#fffaf8] px-6 py-28"
          >
            <Reveal>
              <SectionHeading
                eyebrow="A beautiful beginning"
                title="A little story"
                description="A precious little life, surrounded by love from the very beginning."
              />
            </Reveal>

            <div className="mx-auto mt-16 max-w-5xl">
              <div className="grid items-center gap-12 md:grid-cols-2">
                <Reveal>
                  <div className="relative">
                    <div className="absolute -inset-5 rounded-[35px] bg-[#fce5ec]" />

                    <img
                      src="/eliora-faye.jpeg"
                      alt="Eliora Faye"
                      className="relative aspect-[4/5] w-full rounded-[30px] object-cover shadow-xl"
                    />
                  </div>
                </Reveal>

                <Reveal delay={0.15}>
                  <div>
                    <p className="font-serif text-3xl leading-tight text-[#8f5269]">
                      Loved from the
                      <br />
                      very first moment.
                    </p>

                    <p className="mt-6 leading-8 text-[#9c7483]">
                      Eliora Faye is a precious gift who brings warmth, joy, and
                      countless beautiful moments to our family.
                    </p>

                    <p className="mt-5 leading-8 text-[#9c7483]">
                      On this special day, we celebrate not only her baptism,
                      but also the love and faith that will guide her as she
                      grows.
                    </p>

                    <div className="mt-8 flex items-center gap-3 text-[#b85c7b]">
                      <Heart size={18} fill="currentColor" />

                      <span className="font-serif text-lg">
                        With love, from the De Guzman family
                      </span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* TIMELINE */}

          <section className="bg-[#fff0f4] px-6 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="A day to remember"
                title="The celebration"
                description="A simple day filled with faith, family, laughter, and love."
              />
            </Reveal>

            <div className="relative mx-auto mt-16 max-w-3xl">
              <div className="absolute left-[24px] top-4 h-[calc(100%-30px)] w-px bg-[#e4b7c6] md:left-1/2" />

              <TimelineItem
                number="01"
                time="10:30 AM"
                title="Baptism Ceremony"
                description="Join us as Eliora receives the sacrament of baptism."
                icon={<Church size={19} />}
                align="left"
              />

              <TimelineItem
                number="02"
                time="11:30 AM"
                title="Family Photos"
                description="A few precious moments captured with family and loved ones."
                icon={<Heart size={19} />}
                align="right"
              />

              <TimelineItem
                number="03"
                time="12:00 PM"
                title="Reception"
                description="Let's gather, enjoy good food, and celebrate together."
                icon={<PartyPopper size={19} />}
                align="left"
              />
            </div>
          </section>

          {/* COUNTDOWN */}

          <section className="relative overflow-hidden bg-[#fffaf8] px-6 py-28">
            <FloatingMiniHearts />

            <Reveal>
              <SectionHeading
                eyebrow="Counting the days"
                title="Until we celebrate"
                description="Save the date and come celebrate this beautiful milestone with us."
              />
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
              <CountdownBox value={timeLeft.days} label="Days" />

              <CountdownBox value={timeLeft.hours} label="Hours" />

              <CountdownBox value={timeLeft.minutes} label="Minutes" />

              <CountdownBox value={timeLeft.seconds} label="Seconds" />
            </div>

            <motion.button
              whileHover={{
                y: -2,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={addToCalendar}
              className="mx-auto mt-10 flex items-center gap-2 rounded-full border border-[#dca8ba] bg-white px-6 py-3 text-sm font-medium text-[#a45d77] shadow-sm"
            >
              <CalendarDays size={17} />
              Add to Calendar
            </motion.button>
          </section>

          {/* GALLERY */}

          <section className="bg-[#fce5ec] px-6 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="Little moments"
                title="Eliora's gallery"
                description="A few sweet moments we'd love to share with you."
              />
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3">
              {GALLERY.map((image, index) => (
                <Reveal key={`${image.src}-${index}`} delay={index * 0.05}>
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() => setSelectedImage(index)}
                    className={`group relative w-full overflow-hidden rounded-3xl bg-white shadow-md ${
                      index === 0 ? "md:row-span-2" : ""
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full object-cover transition duration-700 group-hover:scale-105 aspect-square"
                    />

                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                      <p className="text-left text-sm text-white">
                        {image.title}
                      </p>
                    </div>
                  </motion.button>
                </Reveal>
              ))}
            </div>
          </section>

          {/* GODPARENTS */}

          <section className="relative overflow-hidden bg-[#fff0f4] px-6 py-28">
            <FloatingDecor />

            <Reveal>
              <SectionHeading
                eyebrow="Chosen with love"
                title="Eliora's Godparents"
                description="People who will help guide, support, and surround Eliora with love as she grows."
              />
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mx-auto mt-12 max-w-2xl rounded-[35px] border border-white/70 bg-white/65 p-7 text-center shadow-lg backdrop-blur-md md:p-10">
                <Heart
                  className="mx-auto text-[#b85c7b]"
                  size={27}
                  fill="currentColor"
                />

                <p className="mt-5 font-serif text-xl leading-8 text-[#8f5269]">
                  “It takes a village to raise a child, and we are grateful for
                  the wonderful people chosen to be part of Eliora&apos;s
                  journey.”
                </p>
              </div>
            </Reveal>

            <div className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2">
              {GODPARENTS.map((name, index) => (
                <Reveal key={name} delay={index * 0.06}>
                  <motion.div
                    whileHover={{
                      y: -3,
                      scale: 1.01,
                    }}
                    className="flex items-center gap-4 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f6d8e2] font-serif text-sm text-[#a45d77]">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-[#8f5269]">{name}</p>

                      <p className="mt-1 text-xs text-[#b08a98]">
                        Chosen with love
                      </p>
                    </div>

                    <Heart
                      size={15}
                      className="ml-auto shrink-0 text-[#d394a8]"
                      fill="currentColor"
                    />
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* VENUES */}

          <section className="bg-[#fffaf8] px-6 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="Where we'll gather"
                title="Church & Reception"
                description="Two places, one beautiful celebration."
              />
            </Reveal>

            <div className="mx-auto mt-14 max-w-5xl">
              <div className="grid items-stretch gap-5 md:grid-cols-[1fr_auto_1fr]">
                <VenueCard
                  icon={<Church size={22} />}
                  label="Baptism Ceremony"
                  title={EVENT.church}
                  subtitle={EVENT.churchSubtitle}
                  href="https://www.google.com/maps/search/?api=1&query=Saint+Francis+of+Assisi+and+Santa+Quiteria+Parish+Church"
                />

                <div className="hidden items-center justify-center md:flex">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e6c0cc] bg-[#fff0f4] text-[#b85c7b]">
                    <ArrowRight size={18} />
                  </div>
                </div>

                <VenueCard
                  icon={<PartyPopper size={22} />}
                  label="Reception"
                  title={EVENT.reception}
                  subtitle="Lunch & Celebration"
                  href="https://www.google.com/maps/search/?api=1&query=Savory+SM+North+Edsa+Annex"
                />
              </div>
            </div>
          </section>

          {/* DRESS CODE */}

          <section className="bg-[#fce5ec] px-6 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="A little style"
                title="Dress Code"
                description="Pastel pink and white are lovingly requested for our special day."
              />
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mx-auto mt-12 max-w-2xl rounded-[35px] bg-white p-8 text-center shadow-lg md:p-10">
                <Shirt className="mx-auto text-[#b85c7b]" size={28} />

                <p className="mt-5 font-serif text-2xl text-[#8f5269]">
                  Pastel Pink & White
                </p>

                <div className="mt-7 flex justify-center gap-4">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-[#f2b6c8] shadow-md" />
                    <p className="mt-2 text-xs text-[#a57887]">Pastel Pink</p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full border border-[#eee2df] bg-[#fffaf5] shadow-md" />
                    <p className="mt-2 text-xs text-[#a57887]">White</p>
                  </div>

                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-[#dba2b5] shadow-md" />
                    <p className="mt-2 text-xs text-[#a57887]">Rose</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* =====================================================
              PHOTO BOOTH
          ===================================================== */}

          <PhotoBooth />

          {/* =====================================================
    GUESTBOOK
===================================================== */}

          <section
            id="guestbook"
            className="relative overflow-hidden bg-[#fffaf8] px-6 py-28"
          >
            <FloatingDecor />

            <Reveal>
              <SectionHeading
                eyebrow="A little love for Eliora"
                title="Her Little Guestbook"
                description="Leave a sweet message, a prayer, or a little wish for Eliora to read someday."
              />
            </Reveal>

            <div className="relative z-10 mx-auto mt-16 max-w-6xl">
              <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
                {/* =================================================
          WRITE A MESSAGE
      ================================================= */}

                <Reveal>
                  <div className="relative overflow-hidden rounded-[35px] border border-[#f0d9e1] bg-white p-7 shadow-xl shadow-[#d9a6b6]/10 md:p-9">
                    {/* Decorative top */}
                    <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#fce5ec]" />

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fce5ec] text-[#b85c7b] shadow-sm">
                          <MessageCircleHeart size={25} />
                        </div>

                        <div className="flex items-center gap-1 text-[#d79bae]">
                          <Heart size={13} fill="currentColor" />
                          <Heart size={10} fill="currentColor" />
                          <Heart size={13} fill="currentColor" />
                        </div>
                      </div>

                      <p className="mt-7 text-[10px] uppercase tracking-[0.3em] text-[#b9788d]">
                        Leave a little love
                      </p>

                      <h3 className="mt-2 font-serif text-3xl text-[#8f5269]">
                        Write for Eliora
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[#a17e8b]">
                        Your words will become part of a little collection of
                        memories for Eliora and her family.
                      </p>

                      <form onSubmit={handleGuestbookSubmit} className="mt-8">
                        {/* NAME */}

                        <div>
                          <label className="text-xs font-medium uppercase tracking-[0.16em] text-[#8f5269]">
                            Your name
                          </label>

                          <div className="relative mt-2">
                            <input
                              value={guestName}
                              onChange={(event) => {
                                setGuestName(event.target.value);

                                if (guestErrors.name) {
                                  setGuestErrors((prev) => ({
                                    ...prev,
                                    name: "",
                                  }));
                                }
                              }}
                              maxLength={80}
                              placeholder="e.g. Auntie Joy"
                              className={`w-full rounded-2xl border bg-[#fffafc] px-4 py-3.5 text-sm text-[#71495a] outline-none transition placeholder:text-[#c5aab4] ${
                                guestErrors.name
                                  ? "border-red-400"
                                  : "border-[#ead5dc] focus:border-[#c9899f] focus:bg-white focus:ring-4 focus:ring-[#fce5ec]"
                              }`}
                            />

                            <Heart
                              size={15}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d49aac]"
                            />
                          </div>

                          {guestErrors.name && (
                            <motion.p
                              initial={{ opacity: 0, y: -3 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 text-xs text-red-500"
                            >
                              {guestErrors.name}
                            </motion.p>
                          )}
                        </div>

                        {/* MESSAGE */}

                        <div className="mt-5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-[0.16em] text-[#8f5269]">
                              Your message
                            </label>

                            <span className="text-[10px] text-[#c09da9]">
                              {guestMessage.length}/500
                            </span>
                          </div>

                          <div className="relative mt-2">
                            <textarea
                              value={guestMessage}
                              onChange={(event) => {
                                setGuestMessage(event.target.value);

                                if (guestErrors.message) {
                                  setGuestErrors((prev) => ({
                                    ...prev,
                                    message: "",
                                  }));
                                }
                              }}
                              maxLength={500}
                              rows={6}
                              placeholder="Write a prayer, wish, or something sweet for Eliora..."
                              className={`w-full resize-none rounded-2xl border bg-[#fffafc] px-4 py-4 text-sm leading-7 text-[#71495a] outline-none transition placeholder:text-[#c5aab4] ${
                                guestErrors.message
                                  ? "border-red-400"
                                  : "border-[#ead5dc] focus:border-[#c9899f] focus:bg-white focus:ring-4 focus:ring-[#fce5ec]"
                              }`}
                            />

                            <div className="pointer-events-none absolute bottom-4 right-4 text-[#e2b5c3]">
                              <Sparkles size={16} />
                            </div>
                          </div>

                          {guestErrors.message && (
                            <motion.p
                              initial={{ opacity: 0, y: -3 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1.5 text-xs text-red-500"
                            >
                              {guestErrors.message}
                            </motion.p>
                          )}
                        </div>

                        {/* SUBMIT */}

                        <motion.button
                          type="submit"
                          disabled={isSubmittingGuestbook}
                          whileHover={
                            !isSubmittingGuestbook
                              ? {
                                  y: -2,
                                  scale: 1.01,
                                }
                              : undefined
                          }
                          whileTap={
                            !isSubmittingGuestbook
                              ? {
                                  scale: 0.98,
                                }
                              : undefined
                          }
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#b85c7b] px-5 py-4 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20 transition disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmittingGuestbook ? (
                            <>
                              <motion.span
                                animate={{
                                  rotate: 360,
                                }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="block"
                              >
                                <Sparkles size={16} />
                              </motion.span>
                              Saving your message...
                            </>
                          ) : (
                            <>
                              Send a Little Love
                              <Heart size={16} fill="currentColor" />
                            </>
                          )}
                        </motion.button>

                        <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#b99aa5]">
                          <Sparkles size={11} />
                          Your message will be kept as a sweet memory.
                          <Sparkles size={11} />
                        </p>
                      </form>
                    </div>
                  </div>
                </Reveal>

                {/* =================================================
          MEMORY WALL
      ================================================= */}

                <Reveal delay={0.12}>
                  <div>
                    {/* Header */}

                    <div className="mb-6 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#b9788d]">
                          Messages from loved ones
                        </p>

                        <h3 className="mt-2 font-serif text-3xl text-[#8f5269]">
                          Little notes
                        </h3>
                      </div>

                      {guestEntries.length > 0 && (
                        <div className="flex items-center gap-2 rounded-full border border-[#efdce3] bg-white px-3 py-1.5 text-xs text-[#a77c8a] shadow-sm">
                          <Heart
                            size={12}
                            fill="currentColor"
                            className="text-[#c9899f]"
                          />
                          {guestEntries.length}{" "}
                          {guestEntries.length === 1 ? "message" : "messages"}
                        </div>
                      )}
                    </div>

                    {displayedGuests.length === 0 ? (
                      /* EMPTY STATE */

                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        className="relative flex min-h-[430px] flex-col items-center justify-center overflow-hidden rounded-[35px] border border-dashed border-[#e5c6d1] bg-white/70 px-8 text-center shadow-sm"
                      >
                        <div className="absolute left-8 top-8 rotate-[-12deg] text-[#edc5d0]">
                          <Heart size={20} fill="currentColor" />
                        </div>

                        <div className="absolute right-10 top-12 rotate-[15deg] text-[#edc5d0]">
                          <Sparkles size={22} />
                        </div>

                        <div className="absolute bottom-10 left-12 rotate-[10deg] text-[#edc5d0]">
                          <Sparkles size={17} />
                        </div>

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b] shadow-sm">
                          <Heart size={31} fill="currentColor" />
                        </div>

                        <p className="mt-7 font-serif text-2xl text-[#8f5269]">
                          The first little note
                        </p>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#aa8592]">
                          Be the first person to leave a prayer, wish, or sweet
                          message for Eliora.
                        </p>

                        <div className="mt-7 flex items-center gap-3 text-[#d394a8]">
                          <span className="h-px w-10 bg-[#ebccd5]" />
                          <Heart size={12} fill="currentColor" />
                          <span className="h-px w-10 bg-[#ebccd5]" />
                        </div>
                      </motion.div>
                    ) : (
                      /* MEMORY CARDS */

                      <div className="grid gap-4 sm:grid-cols-2">
                        {displayedGuests.map((entry, index) => (
                          <motion.article
                            key={entry.id}
                            initial={{
                              opacity: 0,
                              y: 20,
                              scale: 0.97,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                            }}
                            transition={{
                              delay: index * 0.06,
                              duration: 0.5,
                            }}
                            whileHover={{
                              y: -5,
                              rotate: index % 2 === 0 ? -0.5 : 0.5,
                            }}
                            className="group relative overflow-hidden rounded-[25px] border border-[#f0dfe4] bg-white p-5 shadow-md shadow-[#d7a6b5]/10"
                          >
                            {/* little decorative tape */}

                            <div
                              className={`absolute -top-1 left-1/2 h-5 w-16 -translate-x-1/2 rotate-[-2deg] bg-[#f5dce4]/80 opacity-70 ${
                                index % 2 === 0 ? "" : "rotate-[3deg]"
                              }`}
                            />

                            <div className="flex items-start gap-3 pt-2">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b]">
                                <Heart size={15} fill="currentColor" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-serif text-lg text-[#8f5269]">
                                      {entry.name}
                                    </p>

                                    {entry.createdAt && (
                                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#b99aa5]">
                                        {formatGuestDate(entry.createdAt)}
                                      </p>
                                    )}
                                  </div>

                                  <Heart
                                    size={12}
                                    className="mt-1 shrink-0 text-[#e0aabb] opacity-0 transition group-hover:opacity-100"
                                    fill="currentColor"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-5">
                              <p className="font-serif text-[15px] leading-7 text-[#87606f]">
                                “{entry.message}”
                              </p>
                            </div>

                            <div className="mt-5 flex items-center justify-between">
                              <div className="flex gap-1 text-[#e2b2c1]">
                                <Heart size={9} fill="currentColor" />
                                <Heart size={9} fill="currentColor" />
                                <Heart size={9} fill="currentColor" />
                              </div>

                              <span className="text-[9px] uppercase tracking-[0.2em] text-[#c2a1ac]">
                                With love
                              </span>
                            </div>
                          </motion.article>
                        ))}
                      </div>
                    )}

                    {/* LITTLE NOTES PAGINATION */}

                    {guestEntries.length > GUEST_NOTES_PER_PAGE && (
                      <div className="mt-8 flex flex-col items-center gap-4">
                        <p className="text-xs text-[#b08b98]">
                          Showing{" "}
                          {(guestNotesPage - 1) * GUEST_NOTES_PER_PAGE + 1}
                          {"–"}
                          {Math.min(
                            guestNotesPage * GUEST_NOTES_PER_PAGE,
                            guestEntries.length
                          )}{" "}
                          of {guestEntries.length} little notes
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setGuestNotesPage((page) => Math.max(1, page - 1))
                            }
                            disabled={guestNotesPage === 1}
                            aria-label="Previous page of little notes"
                            className="flex h-10 items-center gap-1 rounded-full border border-[#e8c5d1] bg-white px-4 text-sm text-[#a86d82] shadow-sm transition hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <ChevronLeft size={16} /> Previous
                          </button>

                          {Array.from(
                            { length: totalGuestNotesPages },
                            (_, index) => index + 1
                          ).map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setGuestNotesPage(page)}
                              aria-label={`Go to page ${page} of little notes`}
                              aria-current={
                                guestNotesPage === page ? "page" : undefined
                              }
                              className={`h-10 min-w-10 rounded-full border px-3 text-sm transition ${
                                guestNotesPage === page
                                  ? "border-[#c9899f] bg-[#c9899f] font-semibold text-white shadow-md shadow-[#d7a6b5]/25"
                                  : "border-[#e8c5d1] bg-white text-[#a86d82] hover:bg-[#fff0f4]"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setGuestNotesPage((page) =>
                                Math.min(totalGuestNotesPages, page + 1)
                              )
                            }
                            disabled={guestNotesPage === totalGuestNotesPages}
                            aria-label="Next page of little notes"
                            className="flex h-10 items-center gap-1 rounded-full border border-[#e8c5d1] bg-white px-4 text-sm text-[#a86d82] shadow-sm transition hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Next <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* RESERVATION */}

          <section
            id="reservation"
            className="relative overflow-hidden bg-[#fce5ec] px-6 py-28"
          >
            <FloatingDecor />

            <Reveal>
              <SectionHeading
                eyebrow="Will you celebrate with us?"
                title="Reserve your spot"
                description="Let us know if you'll be joining Eliora's special day."
              />
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mx-auto mt-14 max-w-2xl">
                <AnimatePresence mode="wait">
                  {reservationSuccess ? (
                    <motion.div
                      key="success"
                      initial={{
                        opacity: 0,
                        scale: 0.94,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className="relative overflow-hidden rounded-[35px] bg-white p-8 text-center shadow-xl md:p-12"
                    >
                      <Confetti />

                      <motion.div
                        initial={{
                          scale: 0,
                        }}
                        animate={{
                          scale: 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 12,
                        }}
                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b]"
                      >
                        <CheckCircle2 size={42} />
                      </motion.div>

                      <p className="mt-7 text-xs uppercase tracking-[0.3em] text-[#b9788d]">
                        Reservation confirmed
                      </p>

                      <h3 className="mt-3 font-serif text-3xl text-[#8f5269]">
                        Thank you! 💗
                      </h3>

                      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#a17e8b]">
                        We&apos;re so happy that you&apos;ll be part of
                        Eliora&apos;s special day. We can&apos;t wait to
                        celebrate with you!
                      </p>

                      <div className="mt-8 rounded-2xl bg-[#fff5f7] p-5">
                        <p className="text-sm text-[#8f5269]">
                          Sunday, November 22, 2026
                        </p>

                        <p className="mt-1 text-xs text-[#a98592]">10:30 AM</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReservationSuccess(false)}
                        className="mt-7 text-sm text-[#b85c7b] underline underline-offset-4"
                      >
                        Make another reservation
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleReservationSubmit}
                      className="rounded-[35px] border border-white/80 bg-white/90 p-7 shadow-xl backdrop-blur md:p-10"
                    >
                      <div className="text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b]">
                          <Heart size={23} fill="currentColor" />
                        </div>

                        <h3 className="mt-5 font-serif text-2xl text-[#8f5269]">
                          RSVP
                        </h3>

                        <p className="mt-2 text-sm text-[#a17e8b]">
                          Please fill out the details below.
                        </p>
                      </div>

                      {reservationSubmitError && (
                        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                          {reservationSubmitError}
                        </div>
                      )}

                      {/* NAME */}

                      <div className="mt-8">
                        <label className="text-sm font-medium text-[#8f5269]">
                          Your name
                        </label>

                        <input
                          value={reservationName}
                          onChange={(event) => {
                            setReservationName(event.target.value);

                            setReservationErrors((prev) => ({
                              ...prev,
                              name: "",
                            }));
                          }}
                          maxLength={80}
                          placeholder="Juan Dela Cruz"
                          className={`mt-2 w-full rounded-xl border bg-[#fffafc] px-4 py-3 text-sm outline-none transition ${
                            reservationErrors.name
                              ? "border-red-400"
                              : "border-[#ead5dc] focus:border-[#c9899f]"
                          }`}
                        />

                        {reservationErrors.name && (
                          <p className="mt-1 text-xs text-red-500">
                            {reservationErrors.name}
                          </p>
                        )}
                      </div>

                      {/* ATTENDANCE */}

                      <div className="mt-7">
                        <label className="text-sm font-medium text-[#8f5269]">
                          Will you be joining us?
                        </label>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <AttendanceButton
                            selected={reservationAttendance === "yes"}
                            onClick={() => {
                              setReservationAttendance("yes");

                              setReservationErrors((prev) => ({
                                ...prev,
                                attendance: "",
                              }));
                            }}
                            icon={<CheckCircle2 size={19} />}
                            title="Yes, I'll be there"
                            subtitle="Can't wait to celebrate!"
                          />

                          <AttendanceButton
                            selected={reservationAttendance === "no"}
                            onClick={() => {
                              setReservationAttendance("no");

                              setReservationErrors((prev) => ({
                                ...prev,
                                attendance: "",
                                guests: "",
                              }));
                            }}
                            icon={<X size={19} />}
                            title="Sorry, I can't"
                            subtitle="Sending love from afar"
                          />
                        </div>

                        {reservationErrors.attendance && (
                          <p className="mt-1 text-xs text-red-500">
                            {reservationErrors.attendance}
                          </p>
                        )}
                      </div>

                      {/* GUEST COUNT */}

                      <AnimatePresence>
                        {reservationAttendance === "yes" && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              height: 0,
                              y: -10,
                            }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              height: 0,
                              y: -10,
                            }}
                            className="overflow-hidden"
                          >
                            <div className="mt-7">
                              <label className="flex items-center gap-2 text-sm font-medium text-[#8f5269]">
                                <Users size={16} />
                                Number of guests
                              </label>

                              <p className="mt-1 text-xs text-[#b08b98]">
                                Including yourself
                              </p>

                              <div className="mt-3 flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setReservationGuests(
                                      String(
                                        Math.max(
                                          1,
                                          Number(reservationGuests) - 1
                                        )
                                      )
                                    )
                                  }
                                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ead5dc] bg-white text-[#b85c7b]"
                                >
                                  −
                                </button>

                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={reservationGuests}
                                  onChange={(event) => {
                                    setReservationGuests(event.target.value);

                                    setReservationErrors((prev) => ({
                                      ...prev,
                                      guests: "",
                                    }));
                                  }}
                                  className="h-11 w-full rounded-xl border border-[#ead5dc] bg-[#fffafc] px-4 text-center text-sm outline-none focus:border-[#c9899f]"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setReservationGuests(
                                      String(
                                        Math.min(
                                          20,
                                          Number(reservationGuests) + 1
                                        )
                                      )
                                    )
                                  }
                                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ead5dc] bg-white text-[#b85c7b]"
                                >
                                  +
                                </button>
                              </div>

                              {reservationErrors.guests && (
                                <p className="mt-1 text-xs text-red-500">
                                  {reservationErrors.guests}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* MESSAGE */}

                      <div className="mt-7">
                        <label className="text-sm font-medium text-[#8f5269]">
                          Message
                          <span className="ml-1 text-xs font-normal text-[#b99aa5]">
                            Optional
                          </span>
                        </label>

                        <textarea
                          value={reservationMessage}
                          onChange={(event) => {
                            setReservationMessage(event.target.value);

                            setReservationErrors((prev) => ({
                              ...prev,
                              message: "",
                            }));
                          }}
                          maxLength={300}
                          rows={4}
                          placeholder="Leave a message for Eliora..."
                          className="mt-2 w-full resize-none rounded-xl border border-[#ead5dc] bg-[#fffafc] px-4 py-3 text-sm outline-none transition focus:border-[#c9899f]"
                        />

                        <div className="mt-1 flex justify-end">
                          <span className="text-xs text-[#b99aa5]">
                            {reservationMessage.length}
                            /300
                          </span>
                        </div>

                        {reservationErrors.message && (
                          <p className="mt-1 text-xs text-red-500">
                            {reservationErrors.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReservation}
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b85c7b] px-5 py-4 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20 transition hover:bg-[#a84f6d] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingReservation
                          ? "Saving reservation..."
                          : "Confirm Attendance"}

                        <Send size={17} />
                      </button>

                      <p className="mt-4 text-center text-[11px] leading-5 text-[#b08b98]">
                        Your reservation will be securely saved to our guest
                        list.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>

            {/* LIVE RESERVATION LIST */}
            <Reveal delay={0.2}>
              <div className="mx-auto mt-16 max-w-5xl">
                <div className="mb-6 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b9788d]">
                    Our lovely guests
                  </p>
                  <h3 className="mt-3 font-serif text-3xl text-[#8f5269] md:text-4xl">
                    Reservation list
                  </h3>
                  <p className="mt-3 text-sm text-[#a17e8b]">
                    Thank you for letting us know. The list updates
                    automatically when someone RSVPs.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    {
                      label: "Total RSVPs",
                      value: reservationStats.totalReservations,
                      icon: <Users size={18} />,
                    },
                    {
                      label: "Will attend",
                      value: reservationStats.attendingReservations,
                      icon: <CheckCircle2 size={18} />,
                    },
                    {
                      label: "Guests expected",
                      value: reservationStats.totalAttendingGuests,
                      icon: <Heart size={18} />,
                    },
                    {
                      label: "Can't attend",
                      value: reservationStats.notAttendingReservations,
                      icon: <MessageCircleHeart size={18} />,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm md:p-5"
                    >
                      <div className="flex items-center gap-2 text-[#b85c7b]">
                        {stat.icon}
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a17e8b]">
                          {stat.label}
                        </span>
                      </div>
                      <p className="mt-3 font-serif text-3xl text-[#8f5269]">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {reservationListError ? (
                  <div className="mt-5 rounded-2xl border border-red-100 bg-white p-5 text-center text-sm text-red-600">
                    {reservationListError}
                  </div>
                ) : reservationEntries.length === 0 ? (
                  <div className="mt-5 rounded-3xl border border-white/80 bg-white/75 px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f4] text-[#b85c7b]">
                      <Heart size={23} />
                    </div>
                    <h4 className="mt-4 font-serif text-xl text-[#8f5269]">
                      Be the first to RSVP
                    </h4>
                    <p className="mt-2 text-sm text-[#a17e8b]">
                      Your name will appear here after your reservation is
                      submitted.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#f4e4e9] px-5 py-4 md:px-6">
                      <div>
                        <h4 className="font-serif text-xl text-[#8f5269]">
                          Guest responses
                        </h4>
                        <p className="mt-1 text-xs text-[#b08b98]">
                          {reservationEntries.length}{" "}
                          {reservationEntries.length === 1
                            ? "response"
                            : "responses"}{" "}
                          received
                        </p>
                      </div>
                      <span className="rounded-full bg-[#fff0f4] px-3 py-1 text-xs font-medium text-[#a65372]">
                        Live updates
                      </span>
                    </div>
                    <ul className="divide-y divide-[#f4e4e9]">
                      {reservationEntries.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff0f4] text-[#b85c7b]">
                              {entry.attendance === "yes" ? (
                                <CheckCircle2 size={20} />
                              ) : (
                                <Heart size={19} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[#805065]">
                                {entry.name}
                              </p>
                              <p className="mt-1 text-xs text-[#b08b98]">
                                {entry.attendance === "yes"
                                  ? `${Math.max(
                                      1,
                                      Number(entry.guests) || 1
                                    )} ${
                                      Number(entry.guests) === 1
                                        ? "guest"
                                        : "guests"
                                    } attending`
                                  : "Unable to attend"}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                              entry.attendance === "yes"
                                ? "bg-[#fce5ec] text-[#a45d77]"
                                : "bg-[#f7edf0] text-[#a17e8b]"
                            }`}
                          >
                            {entry.attendance === "yes"
                              ? "Attending"
                              : "Declined"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Reveal>
          </section>

          {/* FINAL THANK YOU */}

          <section className="relative overflow-hidden bg-[#fff5f7] px-6 py-24 md:py-32">
            <FloatingDecor />
            <div className="pointer-events-none absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f8dce5]/55 blur-3xl" />

            <Reveal>
              <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] border border-[#efd2dc] bg-[#fffaf9]/95 p-6 shadow-[0_24px_70px_rgba(143,82,105,0.12)] md:p-12">
                <div className="absolute inset-3 rounded-[28px] border border-[#efd3dc]/80" />
                <div className="relative grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
                  <div className="mx-auto w-full max-w-sm">
                    <div className="relative rounded-t-[48%] rounded-b-[28px] border-[7px] border-white bg-[#f7e5e9] p-2 shadow-xl ring-1 ring-[#e8c7d2]">
                      <img
                        src="/eliora-faye.jpeg"
                        alt="Eliora Faye"
                        className="aspect-[4/5] w-full rounded-t-[45%] rounded-b-[20px] object-cover"
                      />
                      <div className="absolute -right-3 top-12 flex h-12 w-12 items-center justify-center rounded-full border border-white bg-[#fffaf8] text-[#b85c7b] shadow-md">
                        <Heart size={20} fill="currentColor" />
                      </div>
                    </div>
                    <p className="mt-4 text-center text-[10px] uppercase tracking-[0.28em] text-[#b08b98]">
                      A little blessing, loved endlessly
                    </p>
                  </div>

                  <div className="relative text-center md:text-left">
                    <div className="mb-5 flex items-center justify-center gap-3 text-[#bd8799] md:justify-start">
                      <span className="h-px w-10 bg-[#d9b1be]" />
                      <span className="text-xs font-semibold uppercase tracking-[0.3em]">
                        With all our love
                      </span>
                      <span className="h-px w-10 bg-[#d9b1be] md:hidden" />
                    </div>
                    <h2 className="font-serif text-5xl leading-tight text-[#8f5269] md:text-7xl">
                      Thank you
                    </h2>
                    <p className="mt-5 font-serif text-2xl italic text-[#b85c7b]">
                      for being part of her story.
                    </p>
                    <p className="mx-auto mt-5 max-w-lg text-sm leading-8 text-[#9c7483] md:mx-0">
                      Thank you for sharing your prayers, kindness, and love
                      with Eliora Faye. Your presence will make this beautiful
                      milestone even more meaningful to our family.
                    </p>

                    <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[#f0dce3] bg-white/80 px-5 py-4 text-left">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f4] text-[#b85c7b]">
                        <CalendarDays size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#8f5269]">
                          Sunday, November 22, 2026
                        </p>
                        <p className="mt-1 text-xs tracking-wide text-[#b08b98]">
                          10:30 AM · A day of faith & blessings
                        </p>
                      </div>
                    </div>

                    <p className="mt-8 font-serif text-3xl italic text-[#a65372]">
                      Eliora Faye
                    </p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.35em] text-[#b08b98]">
                      De Guzman Family
                    </p>
                    <div className="mt-5 flex justify-center gap-2 text-[#d09aab] md:justify-start">
                      <Heart size={13} fill="currentColor" />
                      <Heart size={17} fill="currentColor" />
                      <Heart size={13} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* FOOTER */}

          <footer className="border-t border-[#f0dbe2] bg-[#fffaf8] px-6 py-8 text-center">
            <p className="font-serif text-lg text-[#8f5269]">
              Eliora Faye & Family
            </p>

            <p className="mt-2 text-xs text-[#b08b98]">November 22, 2026</p>

            <div className="mt-4 flex justify-center text-[#d08fa4]">
              <Heart size={15} fill="currentColor" />
            </div>
          </footer>
        </motion.div>
      )}

      {/* =====================================================
          GALLERY LIGHTBOX
      ===================================================== */}

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#3e2730]/90 p-5 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              className="absolute left-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md md:left-8"
            >
              <ChevronLeft size={23} />
            </button>

            <motion.div
              key={selectedImage}
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onClick={(event) => event.stopPropagation()}
              className="max-w-3xl"
            >
              <img
                src={GALLERY[selectedImage].src}
                alt={GALLERY[selectedImage].title}
                className="max-h-[75vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
              />

              <p className="mt-4 text-center font-serif text-lg text-white">
                {GALLERY[selectedImage].title}
              </p>

              <p className="mt-1 text-center text-xs text-white/60">
                {selectedImage + 1} / {GALLERY.length}
              </p>
            </motion.div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md md:right-8"
            >
              <ChevronRight size={23} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* =========================================================
   PHOTO BOOTH
========================================================= */

function PhotoBooth() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState(
    PHOTO_TEMPLATES[0].id
  );
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [finalPhoto, setFinalPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const selectedTemplate =
    PHOTO_TEMPLATES.find((template) => template.id === selectedTemplateId) ??
    PHOTO_TEMPLATES[0];

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
  };

  const startCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by this browser.");
      return;
    }

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch (error) {
      console.error("CAMERA ERROR:", error);
      setCameraError(
        "Please allow camera access in your browser to use the photo booth."
      );
      setIsCameraOpen(false);
    }
  };

  const selectTemplate = (template: PhotoTemplate) => {
    stopCamera();
    setSelectedTemplateId(template.id);
    setCapturedPhotos([]);
    setFinalPhoto(null);
    setCameraError("");
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const drawCover = (
    context: CanvasRenderingContext2D,
    image: CanvasImageSource,
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 0
  ) => {
    const source = image as HTMLImageElement;
    const sourceWidth = source.naturalWidth || source.width || 1;
    const sourceHeight = source.naturalHeight || source.height || 1;
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = width / height;

    let sx = 0;
    let sy = 0;
    let sw = sourceWidth;
    let sh = sourceHeight;

    if (sourceRatio > targetRatio) {
      sw = sourceHeight * targetRatio;
      sx = (sourceWidth - sw) / 2;
    } else {
      sh = sourceWidth / targetRatio;
      sy = (sourceHeight - sh) / 2;
    }

    context.save();
    context.beginPath();
    if (radius > 0) {
      context.roundRect(x, y, width, height, radius);
    } else {
      context.rect(x, y, width, height);
    }
    context.clip();
    context.drawImage(image, sx, sy, sw, sh, x, y, width, height);
    context.restore();
  };

  const drawSlot = (
    context: CanvasRenderingContext2D,
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 24
  ) => {
    context.save();
    context.shadowColor = "rgba(120,70,90,.16)";
    context.shadowBlur = 24;
    context.fillStyle = "#ffffff";
    context.fillRect(x - 10, y - 10, width + 20, height + 20);
    context.restore();

    drawCover(context, image, x, y, width, height, radius);

    context.save();
    context.strokeStyle = selectedTemplate.border;
    context.lineWidth = 5;
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.stroke();
    context.restore();
  };

  const drawText = (
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    font: string,
    color = selectedTemplate.accent
  ) => {
    context.fillStyle = color;
    context.font = font;
    context.textAlign = "center";
    context.fillText(text, x, y);
  };

  const drawBotanicalArtwork = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    theme: "eucalyptus" | "blush"
  ) => {
    context.save();
    const leaf = (
      x: number,
      y: number,
      angle: number,
      color: string,
      scale = 1
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.strokeStyle = color;
      context.lineWidth = 2.5 * scale;
      context.beginPath();
      context.moveTo(0, 0);
      context.quadraticCurveTo(38 * scale, -20 * scale, 86 * scale, -2 * scale);
      context.stroke();
      for (let i = 1; i <= 4; i++) {
        const px = i * 16 * scale;
        context.fillStyle = color;
        context.globalAlpha = 0.78;
        context.beginPath();
        context.ellipse(
          px,
          -10 * scale,
          15 * scale,
          6 * scale,
          -0.55,
          0,
          Math.PI * 2
        );
        context.fill();
        context.beginPath();
        context.ellipse(
          px + 6 * scale,
          8 * scale,
          14 * scale,
          5.5 * scale,
          0.55,
          0,
          Math.PI * 2
        );
        context.fill();
      }
      context.globalAlpha = 1;
      context.restore();
    };
    const flower = (x: number, y: number, r: number, color: string) => {
      context.save();
      context.translate(x, y);
      for (let i = 0; i < 7; i++) {
        context.rotate((Math.PI * 2) / 7);
        context.fillStyle = color;
        context.globalAlpha = 0.78;
        context.beginPath();
        context.ellipse(0, -r * 0.65, r * 0.34, r * 0.68, 0, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.fillStyle = theme === "blush" ? "#c9899f" : "#d394a8";
      context.beginPath();
      context.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    if (theme === "eucalyptus") {
      // Airy botanical sprigs tucked into the corners, leaving photos and copy unobstructed.
      leaf(34, 180, 0.45, "#e7a8bb", 1.05);
      leaf(40, 250, 0.5, "#d98da7", 0.86);
      leaf(width - 118, 175, 2.7, "#e7a8bb", 1.05);
      leaf(width - 120, 245, 2.65, "#d98da7", 0.86);
      leaf(35, height - 175, -0.5, "#e7a8bb", 0.95);
      leaf(width - 120, height - 175, 3.65, "#d98da7", 0.95);
      flower(78, 76, 13, "#f5dce4");
      flower(width - 78, 76, 13, "#f5dce4");
      context.fillStyle = "#d394a8";
      context.globalAlpha = 0.85;
      context.font = "24px Georgia";
      context.textAlign = "center";
      context.fillText("✦", width / 2, 54);
      context.globalAlpha = 1;
    } else {
      // Blush watercolor-like flower clusters with sage leaves in the corners.
      flower(70, 76, 23, "#e7a8bb");
      flower(119, 57, 15, "#fce5ec");
      flower(45, 118, 12, "#d98da7");
      flower(width - 70, 76, 23, "#e7a8bb");
      flower(width - 119, 57, 15, "#fce5ec");
      flower(width - 45, 118, 12, "#d98da7");
      flower(70, height - 80, 21, "#e7a8bb");
      flower(width - 70, height - 80, 21, "#e7a8bb");
      leaf(26, 142, 0.18, "#e7a8bb", 0.72);
      leaf(width - 116, 142, 2.92, "#e7a8bb", 0.72);
      context.fillStyle = "#c9849e";
      context.font = "27px Georgia";
      context.textAlign = "center";
      context.fillText("♡", width / 2, 55);
    }
    context.restore();
  };

  const composePhotos = async (photos: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas || photos.length < selectedTemplate.slots) return;

    setIsComposing(true);
    try {
      await renderKeepsakeCanvas(
        canvas,
        photos,
        selectedTemplate,
        orientation,
        loadImage
      );
      setFinalPhoto(canvas.toDataURL("image/jpeg", 0.94));
      stopCamera();
    } catch (error) {
      console.error("COMPOSE PHOTO ERROR:", error);
      setCameraError("We couldn't create the keepsake. Please try again.");
    } finally {
      setIsComposing(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || isCapturing || isComposing) return;

    setIsCapturing(true);
    setCountdown(3);

    try {
      for (let value = 3; value >= 1; value -= 1) {
        setCountdown(value);
        await new Promise((resolve) => setTimeout(resolve, 450));
      }

      setCountdown(null);

      const rawCanvas = document.createElement("canvas");
      rawCanvas.width = video.videoWidth || 1280;
      rawCanvas.height = video.videoHeight || 720;

      const context = rawCanvas.getContext("2d");
      if (!context) return;

      context.translate(rawCanvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, rawCanvas.width, rawCanvas.height);

      const rawPhoto = rawCanvas.toDataURL("image/jpeg", 0.92);
      const nextPhotos = [...capturedPhotos, rawPhoto].slice(
        0,
        selectedTemplate.slots
      );
      setCapturedPhotos(nextPhotos);

      if (nextPhotos.length === selectedTemplate.slots) {
        await composePhotos(nextPhotos);
      }
    } catch (error) {
      console.error("CAPTURE PHOTO ERROR:", error);
      setCameraError("Something went wrong while taking the photo.");
      setCountdown(null);
    } finally {
      setIsCapturing(false);
    }
  };

  const beginBooth = () => {
    setFinalPhoto(null);
    setCapturedPhotos([]);
    void startCamera();
  };

  const retakeLast = () => {
    setFinalPhoto(null);
    setCapturedPhotos((photos) => photos.slice(0, -1));
    void startCamera();
  };

  const clearPhotos = () => {
    stopCamera();
    setFinalPhoto(null);
    setCapturedPhotos([]);
    setCountdown(null);
  };

  const savePhoto = () => {
    if (!finalPhoto) return;

    const link = document.createElement("a");
    link.href = finalPhoto;
    link.download = `eliora-faye-${selectedTemplate.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const previewImage = "/eliora-faye.jpeg";

  return (
    <section
      id="photo-booth"
      className="relative overflow-hidden bg-[#fff0f4] px-6 py-28"
    >
      <FloatingDecor />

      <Reveal>
        <SectionHeading
          eyebrow="Choose your keepsake design"
          title="Eliora's Photo Booth"
          description="Choose portrait or landscape, pick a collage layout, and save a keepsake with elegant typography and clear photo/text spacing."
        />
      </Reveal>

      <div className="relative z-10 mx-auto mt-14 max-w-6xl">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_0.95fr]">
          <Reveal>
            <div className="rounded-[38px] border border-[#efd3dc] bg-white p-4 shadow-2xl shadow-[#c78da0]/10 md:p-6">
              <div
                className={`relative overflow-hidden rounded-[30px] bg-[#f8e2e9] ${
                  orientation === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"
                }`}
              >
                {finalPhoto ? (
                  <img
                    src={finalPhoto}
                    alt="Your Eliora Faye photo booth keepsake"
                    className="h-full w-full object-contain bg-[#fff8fa]"
                  />
                ) : isCameraOpen ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full scale-x-[-1] object-cover"
                    />

                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-3 rounded-[26px] border-[5px] border-white/70" />

                      <div className="absolute left-5 top-5 rounded-full bg-white/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a6076] shadow-md backdrop-blur">
                        Photo{" "}
                        {Math.min(
                          capturedPhotos.length + 1,
                          selectedTemplate.slots
                        )}{" "}
                        of {selectedTemplate.slots}
                      </div>

                      {countdown !== null && (
                        <motion.div
                          key={countdown}
                          initial={{ opacity: 0, scale: 1.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="font-serif text-8xl font-bold text-white drop-shadow-2xl">
                            {countdown}
                          </span>
                        </motion.div>
                      )}

                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f5269] shadow-md">
                        {selectedTemplate.message}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
                      <Camera size={32} className="text-[#b85c7b]" />
                      <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#b85c7b] text-sm text-white">
                        {selectedTemplate.slots}
                      </span>
                    </div>

                    <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-[#b9788d]">
                      {selectedTemplate.subtitle}
                    </p>
                    <h3 className="mt-2 font-serif text-2xl text-[#8f5269]">
                      {selectedTemplate.name}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-[#a17e8b]">
                      {selectedTemplate.slots === 1
                        ? "One beautiful portrait, framed like a keepsake."
                        : `Take ${selectedTemplate.slots} photos and we'll build the collage automatically.`}
                    </p>

                    <button
                      type="button"
                      onClick={beginBooth}
                      className="mt-6 flex items-center gap-2 rounded-full bg-[#b85c7b] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20 transition hover:-translate-y-0.5"
                    >
                      <Camera size={17} />
                      Start Photo Booth
                    </button>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {capturedPhotos.length > 0 && !finalPhoto && (
                <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
                  {capturedPhotos.map((photo, index) => (
                    <div
                      key={`${photo.slice(0, 20)}-${index}`}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#e8b6c5] bg-white p-0.5"
                    >
                      <img
                        src={photo}
                        alt={`Captured photo ${index + 1}`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <span className="absolute bottom-1 left-1 rounded-full bg-white/90 px-1.5 text-[9px] font-bold text-[#9a6076]">
                        {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {finalPhoto ? (
                  <>
                    <button
                      type="button"
                      onClick={retakeLast}
                      className="flex items-center gap-2 rounded-full border border-[#e6c4cf] bg-white px-5 py-3 text-sm text-[#a56d7f] transition hover:bg-[#fff6f8]"
                    >
                      <RotateCcw size={16} />
                      Retake Last
                    </button>
                    <button
                      type="button"
                      onClick={savePhoto}
                      className="flex items-center gap-2 rounded-full bg-[#b85c7b] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20 transition hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      Save Keepsake
                    </button>
                  </>
                ) : isCameraOpen ? (
                  <>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={isCapturing || isComposing}
                      className="flex items-center gap-2 rounded-full bg-[#b85c7b] px-7 py-3 text-sm font-medium text-white shadow-lg shadow-[#b85c7b]/20 transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <Camera size={17} />
                      {isCapturing
                        ? "Get Ready..."
                        : isComposing
                        ? "Creating..."
                        : `Take Photo ${capturedPhotos.length + 1}`}
                    </button>
                    <button
                      type="button"
                      onClick={clearPhotos}
                      className="flex items-center gap-2 rounded-full border border-[#e6c4cf] bg-white px-5 py-3 text-sm text-[#a56d7f]"
                    >
                      <X size={16} />
                      Start Over
                    </button>
                  </>
                ) : null}
              </div>

              {cameraError && (
                <p className="mt-4 text-center text-xs leading-5 text-[#b85c7b]">
                  {cameraError}
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-[38px] border border-[#efd3dc] bg-white p-6 shadow-xl shadow-[#c78da0]/10 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f4] text-[#b85c7b]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#b9788d]">
                    01 • Choose layout
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-[#8f5269]">
                    Different designs, different photo counts
                  </h3>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-[#f0dce2] bg-[#fffafc] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b9788d]">
                  01 • Choose orientation
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOrientation("portrait");
                      setFinalPhoto(null);
                      setCapturedPhotos([]);
                      stopCamera();
                    }}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                      orientation === "portrait"
                        ? "border-[#b85c7b] bg-[#fff0f4]"
                        : "border-[#f0dce2] bg-white hover:border-[#e0b4c2]"
                    }`}
                  >
                    <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border-2 border-[#c78da0] bg-[#fff7fa]">
                      <span className="h-7 w-5 rounded-sm bg-[#e7c2ce]" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#8f5269]">
                        Portrait
                      </span>
                      <span className="text-[10px] text-[#a17e8b]">
                        Vertical • 4:5
                      </span>
                    </span>
                    {orientation === "portrait" && (
                      <CheckCircle2
                        size={16}
                        className="ml-auto text-[#b85c7b]"
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrientation("landscape");
                      setFinalPhoto(null);
                      setCapturedPhotos([]);
                      stopCamera();
                    }}
                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                      orientation === "landscape"
                        ? "border-[#b85c7b] bg-[#fff0f4]"
                        : "border-[#f0dce2] bg-white hover:border-[#e0b4c2]"
                    }`}
                  >
                    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border-2 border-[#c78da0] bg-[#fff7fa]">
                      <span className="h-5 w-8 rounded-sm bg-[#e7c2ce]" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#8f5269]">
                        Landscape
                      </span>
                      <span className="text-[10px] text-[#a17e8b]">
                        Horizontal • 3:2
                      </span>
                    </span>
                    {orientation === "landscape" && (
                      <CheckCircle2
                        size={16}
                        className="ml-auto text-[#b85c7b]"
                      />
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b9788d]">
                02 • Choose photo layout
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
                {PHOTO_TEMPLATES.map((template) => {
                  const active = selectedTemplateId === template.id;

                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className={`group rounded-[22px] border-2 p-2 text-left transition ${
                        active
                          ? "border-[#b85c7b] bg-[#fff5f8] shadow-lg"
                          : "border-[#f0dce2] bg-white hover:-translate-y-1 hover:border-[#e0b4c2] hover:shadow-md"
                      }`}
                    >
                      <TemplatePreview
                        template={template}
                        image={previewImage}
                        orientation={orientation}
                      />

                      <div className="mt-2 flex items-start justify-between gap-2 px-1">
                        <div>
                          <p className="text-sm font-semibold text-[#8f5269]">
                            {template.name}
                          </p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[#b08a98]">
                            {template.subtitle}
                          </p>
                        </div>
                        {active && (
                          <CheckCircle2
                            size={16}
                            className="mt-1 shrink-0 text-[#b85c7b]"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[24px] bg-[#fff6f8] p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-white p-2 text-[#b85c7b] shadow-sm">
                    <Heart size={15} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a6076]">
                      {selectedTemplate.name} • {selectedTemplate.slots}{" "}
                      {selectedTemplate.slots === 1 ? "photo" : "photos"}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-[#a17e8b]">
                      A botanical or blush floral souvenir layout with the name
                      Eliora Faye and the baptism date. The selected design and
                      photo arrangement are saved together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

async function renderKeepsakeCanvas(
  canvas: HTMLCanvasElement,
  photos: string[],
  template: PhotoTemplate,
  orientation: "portrait" | "landscape",
  loadImage: (src: string) => Promise<HTMLImageElement>
): Promise<void> {
  const isLandscape = orientation === "landscape";
  // Keep the export ratio identical to the preview card (portrait 4:5, landscape 3:2).
  const width = isLandscape ? 1500 : 1080;
  const height = isLandscape ? 1000 : 1350;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const images = await Promise.all(
    photos.slice(0, template.slots).map(loadImage)
  );
  const scaleX = (value: number) => (value / 100) * width;
  const scaleY = (value: number) => (value / 100) * height;
  const textColor = "#a64f72";
  const floral = template.theme === "eucalyptus";

  // Match the preview's exact palette: selected template background, border and theme text.
  context.fillStyle = template.background;
  context.fillRect(0, 0, width, height);
  context.save();
  context.strokeStyle = template.border;
  context.lineWidth = Math.max(2, width * 0.006);
  context.beginPath();
  context.roundRect(
    width * 0.012,
    height * 0.012,
    width * 0.976,
    height * 0.976,
    width * 0.043
  );
  context.stroke();
  context.restore();

  // Small corner ornaments mirror the thumbnail and stay clear of the photos and lettering.
  const drawFlower = (x: number, y: number, radius: number, color: string) => {
    context.save();
    context.translate(x, y);
    context.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      context.rotate((Math.PI * 2) / 5);
      context.beginPath();
      context.ellipse(
        0,
        -radius * 0.62,
        radius * 0.38,
        radius * 0.66,
        0,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    context.fillStyle = floral ? "#f0cbd5" : "#f0cbd5";
    context.beginPath();
    context.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    context.fill();
    context.restore();
  };

  if (floral) {
    // Eucalyptus preview: soft sage leaves tucked behind the left/right photo edges,
    // plus tiny gold stars. Keep the same relative placement as TemplatePreview.
    const leafBlob = (
      x: number,
      y: number,
      rx: number,
      ry: number,
      angle: number,
      color: string
    ) => {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.fillStyle = color;
      context.globalAlpha = 0.7;
      context.beginPath();
      context.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };
    context.save();
    context.filter = `blur(${Math.max(1, width * 0.002)}px)`;
    leafBlob(scaleX(1), scaleY(25), scaleX(5.5), scaleY(8), -0.45, "#f0cbd5");
    leafBlob(scaleX(1), scaleY(34), scaleX(5), scaleY(7), 0.28, "#d98da7");
    leafBlob(scaleX(99), scaleY(25), scaleX(5.5), scaleY(8), 0.45, "#f0cbd5");
    leafBlob(scaleX(99), scaleY(34), scaleX(5), scaleY(7), -0.28, "#d98da7");
    context.restore();
    context.fillStyle = "#f0cbd5";
    context.font = `${Math.round(width * 0.03)}px Georgia, serif`;
    context.textAlign = "center";
    context.fillText("✦", scaleX(7), scaleY(7));
    context.fillText("✦", scaleX(93), scaleY(7));
  } else {
    // Blush preview: flower clusters in the top corners and small flowers by the footer.
    drawFlower(scaleX(1.5), scaleY(2), scaleX(4.5), "#d98da7");
    drawFlower(scaleX(7), scaleY(3), scaleX(3), "#f0cbd5");
    drawFlower(scaleX(98.5), scaleY(2), scaleX(4.5), "#d98da7");
    drawFlower(scaleX(93), scaleY(3), scaleX(3), "#f0cbd5");
    drawFlower(scaleX(7), scaleY(84), scaleX(2.5), "#d98da7");
    drawFlower(scaleX(93), scaleY(84), scaleX(2.5), "#d98da7");
  }

  const drawCover = (
    image: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;
    const targetRatio = w / h;
    const sourceRatio = iw / ih;
    let sx = 0,
      sy = 0,
      sw = iw,
      sh = ih;
    if (sourceRatio > targetRatio) {
      sw = ih * targetRatio;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / targetRatio;
      sy = (ih - sh) / 2;
    }
    context.save();
    context.shadowColor = "rgba(90,65,70,.18)";
    context.shadowBlur = width * 0.04;
    context.shadowOffsetY = height * 0.013;
    context.fillStyle = "#fff";
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
    context.fill();
    context.restore();
    context.save();
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
    context.clip();
    context.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    context.restore();
    context.save();
    context.strokeStyle = template.border;
    context.lineWidth = Math.max(2, width * 0.0033);
    context.beginPath();
    context.roundRect(x, y, w, h, radius);
    context.stroke();
    context.restore();
  };
  const slot = (
    index: number,
    left: number,
    top: number,
    w: number,
    h: number,
    radius = 2
  ) => {
    if (!images[index]) return;
    const pixelW = scaleX(w);
    const pixelH = scaleY(h);
    const cornerRadius = Math.min(pixelW, pixelH) * (radius / 100);
    drawCover(
      images[index],
      scaleX(left),
      scaleY(top),
      pixelW,
      pixelH,
      cornerRadius
    );
  };

  // The export now uses the same percentage-based positions as TemplatePreview.
  if (!isLandscape) {
    context.textAlign = "center";
    context.fillStyle = textColor;
    context.font = `600 ${Math.round(width * 0.0167)}px Arial, sans-serif`;
    context.letterSpacing = `${width * 0.0016}px`;
    context.fillText("THE HOLY BAPTISM OF", width / 2, scaleY(6.8));
    context.letterSpacing = "0px";
    context.font = `italic ${Math.round(
      width * 0.0433
    )}px Georgia, 'Times New Roman', serif`;
    context.fillText("Eliora Faye", width / 2, scaleY(10.6));
    context.strokeStyle = template.border;
    context.lineWidth = Math.max(2, width * 0.0012);
    context.beginPath();
    context.moveTo(scaleX(28), scaleY(13));
    context.lineTo(scaleX(72), scaleY(13));
    context.stroke();

    if (template.style === "single") slot(0, 8, 16, 84, 55);
    else if (template.style === "duo") {
      slot(0, 6, 16, 42, 55);
      slot(1, 52, 16, 42, 55);
    } else if (template.style === "trio") {
      slot(0, 6, 16, 54, 55);
      slot(1, 64, 16, 30, 25);
      slot(2, 64, 45, 30, 25);
    } else if (template.style === "grid") {
      const gx = 6,
        gy = 16,
        gw = 88,
        gh = 57,
        gap = 1.5;
      slot(0, gx, gy, (gw - gap) / 2, (gh - gap) / 2);
      slot(1, gx + (gw + gap) / 2, gy, (gw - gap) / 2, (gh - gap) / 2);
      slot(2, gx, gy + (gh + gap) / 2, (gw - gap) / 2, (gh - gap) / 2);
      slot(
        3,
        gx + (gw + gap) / 2,
        gy + (gh + gap) / 2,
        (gw - gap) / 2,
        (gh - gap) / 2
      );
    } else if (template.style === "masonry") {
      slot(0, 6, 16, 42, 42);
      slot(1, 52, 16, 42, 20);
      slot(2, 52, 40, 42, 18);
      slot(3, 6, 60, 88, 12);
    } else if (template.style === "portrait") slot(0, 15, 18, 70, 50, 45);

    context.fillStyle = textColor;
    context.textAlign = "center";
    context.font = `italic ${Math.round(
      width * 0.04
    )}px Georgia, 'Times New Roman', serif`;
    context.fillText("Eliora Faye", width / 2, scaleY(91.5));
    context.font = `600 ${Math.round(width * 0.0167)}px Arial, sans-serif`;
    context.letterSpacing = `${width * 0.0012}px`;
    context.fillText("HOLY BAPTISM • NOVEMBER 22, 2026", width / 2, scaleY(97));
    context.letterSpacing = "0px";
  } else {
    context.textAlign = "center";
    context.fillStyle = textColor;
    context.font = `600 ${Math.round(width * 0.0167)}px Arial, sans-serif`;
    context.letterSpacing = `${width * 0.001}px`;
    context.fillText("THE HOLY BAPTISM OF", scaleX(17.5), scaleY(14.2));
    context.letterSpacing = "0px";
    context.font = `italic ${Math.round(
      width * 0.0433
    )}px Georgia, 'Times New Roman', serif`;
    context.fillText("Eliora Faye", scaleX(17.5), scaleY(27));
    context.strokeStyle = template.border;
    context.lineWidth = Math.max(2, width * 0.0012);
    context.beginPath();
    context.moveTo(scaleX(8), scaleY(30));
    context.lineTo(scaleX(28), scaleY(30));
    context.stroke();

    if (template.style === "single") slot(0, 34, 9, 60, 60);
    else if (template.style === "duo") {
      slot(0, 34, 9, 29, 60);
      slot(1, 65, 9, 29, 60);
    } else if (template.style === "trio") {
      slot(0, 34, 9, 36, 60);
      slot(1, 72, 9, 22, 32);
      slot(2, 72, 44, 22, 27);
    } else if (template.style === "grid") {
      const gx = 34,
        gy = 9,
        gw = 60,
        gh = 56,
        gap = 1.5;
      slot(0, gx, gy, (gw - gap) / 2, (gh - gap) / 2);
      slot(1, gx + (gw + gap) / 2, gy, (gw - gap) / 2, (gh - gap) / 2);
      slot(2, gx, gy + (gh + gap) / 2, (gw - gap) / 2, (gh - gap) / 2);
      slot(
        3,
        gx + (gw + gap) / 2,
        gy + (gh + gap) / 2,
        (gw - gap) / 2,
        (gh - gap) / 2
      );
    } else if (template.style === "masonry") {
      slot(0, 34, 9, 28, 60);
      slot(1, 64, 9, 30, 32);
      slot(2, 64, 44, 30, 27);
      slot(3, 34, 72, 60, 12);
    } else if (template.style === "portrait") slot(0, 38, 12, 52, 58, 45);

    context.fillStyle = textColor;
    context.textAlign = "center";
    context.font = `italic ${Math.round(
      width * 0.04
    )}px Georgia, 'Times New Roman', serif`;
    context.fillText("Eliora Faye", width / 2, scaleY(92));
    context.font = `600 ${Math.round(width * 0.0167)}px Arial, sans-serif`;
    context.letterSpacing = `${width * 0.0008}px`;
    context.fillText("HOLY BAPTISM • NOVEMBER 22, 2026", width / 2, scaleY(97));
    context.letterSpacing = "0px";
  }
}

function TemplatePreview({
  template,
  image,
  orientation,
}: {
  template: PhotoTemplate;
  image: string;
  orientation: "portrait" | "landscape";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const loadPreviewImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const render = async () => {
      try {
        // Use the very same canvas renderer as Save Keepsake, including its typography,
        // border, photo crop, decorations, spacing and orientation-specific positions.
        await renderKeepsakeCanvas(
          canvas,
          Array.from({ length: template.slots }, () => image),
          template,
          orientation,
          loadPreviewImage
        );
      } catch (error) {
        console.error("TEMPLATE PREVIEW ERROR:", error);
      }
    };

    void render();
  }, [template, image, orientation]);

  return (
    <div
      className={`relative overflow-hidden rounded-[13px] ${
        orientation === "portrait" ? "aspect-[4/5]" : "aspect-[3/2]"
      }`}
      style={{ background: template.background }}
    >
      <canvas
        ref={canvasRef}
        aria-label={`${template.name} photo layout preview`}
        className="block h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-[#b9788d]">
        {eyebrow}
      </p>

      <h2 className="mt-4 font-serif text-4xl text-[#8f5269] md:text-5xl">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#a17e8b]">
        {description}
      </p>

      <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-[#d394a8]">
        <span className="h-px w-10 bg-[#e8c5d0]" />

        <Heart size={12} fill="currentColor" />

        <span className="h-px w-10 bg-[#e8c5d0]" />
      </div>
    </div>
  );
}

/* =========================================================
   INFO PILL
========================================================= */

function InfoPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#edd4dc] bg-white/70 px-4 py-2 text-xs text-[#a16e81] shadow-sm">
      {icon}
      {text}
    </div>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function TimelineItem({
  time,
  title,
  description,
  icon,
  align,
}: {
  number: string;
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  align: "left" | "right";
}) {
  return (
    <Reveal>
      <div className="relative mb-10 grid grid-cols-[48px_1fr] gap-5 md:grid-cols-[1fr_70px_1fr] md:gap-8">
        <div
          className={`hidden md:block ${
            align === "right" ? "text-right" : "text-left"
          }`}
        >
          {align === "left" && (
            <TimelineContent
              time={time}
              title={title}
              description={description}
            />
          )}
        </div>

        <div className="relative z-10 flex justify-center">
          <motion.div
            whileHover={{
              scale: 1.08,
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#fff0f4] bg-[#b85c7b] text-white shadow-lg"
          >
            {icon}
          </motion.div>
        </div>

        <div>
          <div className="md:hidden">
            <TimelineContent
              time={time}
              title={title}
              description={description}
            />
          </div>

          <div className="hidden md:block">
            {align === "right" && (
              <TimelineContent
                time={time}
                title={title}
                description={description}
              />
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function TimelineContent({
  time,
  title,
  description,
}: {
  time: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b85c7b]">
        {time}
      </p>

      <h3 className="mt-2 font-serif text-xl text-[#8f5269]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#a17e8b]">{description}</p>
    </div>
  );
}

/* =========================================================
   COUNTDOWN
========================================================= */

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="rounded-3xl border border-[#efd7df] bg-white p-5 text-center shadow-sm"
    >
      <motion.p
        key={value}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="font-serif text-4xl text-[#b85c7b]"
      >
        {String(value).padStart(2, "0")}
      </motion.p>

      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[#b08b98]">
        {label}
      </p>
    </motion.div>
  );
}

/* =========================================================
   VENUE CARD
========================================================= */

function VenueCard({
  icon,
  label,
  title,
  subtitle,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
      }}
      className="flex flex-col rounded-[30px] border border-[#efdde3] bg-white p-7 shadow-md"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b]">
        {icon}
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.25em] text-[#b9788d]">
        {label}
      </p>

      <h3 className="mt-3 font-serif text-2xl leading-tight text-[#8f5269]">
        {title}
      </h3>

      <p className="mt-2 text-sm text-[#a17e8b]">{subtitle}</p>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-auto flex items-center gap-2 pt-7 text-sm font-medium text-[#b85c7b]"
      >
        <MapPin size={16} />
        View Location
      </a>
    </motion.div>
  );
}

/* =========================================================
   ATTENDANCE BUTTON
========================================================= */

function AttendanceButton({
  selected,
  onClick,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-[#b85c7b] bg-[#fff0f4] shadow-sm"
          : "border-[#ead5dc] bg-white hover:border-[#dca8ba]"
      }`}
    >
      {selected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#b85c7b] text-white">
          <Check size={12} />
        </div>
      )}

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          selected
            ? "bg-[#f5d5df] text-[#b85c7b]"
            : "bg-[#fff5f7] text-[#b08b98]"
        }`}
      >
        {icon}
      </div>

      <p className="mt-3 text-sm font-medium text-[#8f5269]">{title}</p>

      <p className="mt-1 text-xs text-[#a88a95]">{subtitle}</p>
    </button>
  );
}

/* =========================================================
   REVEAL
========================================================= */

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================
   FLOATING DECOR
========================================================= */

function FloatingDecor() {
  const items = [
    {
      left: "7%",
      top: "18%",
      size: 18,
      duration: 7,
      delay: 0,
    },
    {
      left: "88%",
      top: "15%",
      size: 15,
      duration: 8,
      delay: 1,
    },
    {
      left: "13%",
      top: "72%",
      size: 13,
      duration: 9,
      delay: 2,
    },
    {
      left: "82%",
      top: "78%",
      size: 19,
      duration: 7,
      delay: 0.5,
    },
    {
      left: "50%",
      top: "10%",
      size: 11,
      duration: 6,
      delay: 1.5,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-[#e4aabd]"
          style={{
            left: item.left,
            top: item.top,
          }}
          animate={{
            y: [0, -18, 0],
            x: [0, 7, 0],
            rotate: [0, 10, -5, 0],
            opacity: [0.45, 0.9, 0.45],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {index % 2 === 0 ? (
            <Heart size={item.size} fill="currentColor" />
          ) : (
            <Sparkles size={item.size} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* =========================================================
   MINI HEARTS
========================================================= */

function FloatingMiniHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute text-[#edc0cd]"
          style={{
            left: `${5 + index * 10}%`,
            bottom: `${index % 4}%`,
          }}
          animate={{
            y: [-10, -100],
            opacity: [0, 0.6, 0],
            rotate: [0, 20, -10],
          }}
          transition={{
            duration: 5 + (index % 3),
            delay: index * 0.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          <Heart size={10 + (index % 3) * 3} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}

/* =========================================================
   SPARKLE
========================================================= */

function Sparkle({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <motion.div
      className={`absolute text-[#d99bad] ${className}`}
      animate={{
        rotate: [0, 20, -20, 0],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
    >
      <Sparkles size={size} />
    </motion.div>
  );
}

/* =========================================================
   CONFETTI
========================================================= */

function Confetti() {
  const pieces = Array.from({
    length: 22,
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, index) => {
        const left = 5 + ((index * 17) % 90);

        const delay = (index % 7) * 0.12;

        return (
          <motion.span
            key={index}
            className="absolute top-[-15px] block h-2 w-2 rounded-full bg-[#d994aa]"
            style={{
              left: `${left}%`,
            }}
            initial={{
              y: -20,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: 400 + (index % 5) * 50,
              opacity: [0, 1, 1, 0],
              rotate: 360 + index * 40,
            }}
            transition={{
              duration: 2.5 + (index % 4) * 0.3,
              delay,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        );
      })}
    </div>
  );
}
