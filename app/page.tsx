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

const EVENT_DATE = "2026-11-22T10:00:00";

const EVENT = {
  child: "Eliora Faye De Guzman",
  shortName: "Eliora Faye",
  date: "Sunday, November 22, 2026",
  time: "10:00 AM",
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

type GalleryImage = {
  src: string;
  title: string;
};

/* =========================================================
   DATA
========================================================= */

const GODPARENTS = [
  "Sieder Villareal",
  "Ryan Bulot",
  "Maximiano Consul Jr.",
  "Lorenz Pascual",
  "Jasmine Chavez",
  "Dwight Yanela",
  "Jesselle Caras",
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
    const start = "20261122T100000";
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

  const displayedGuests = useMemo(
    () => guestEntries.slice(0, 6),
    [guestEntries]
  );

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

                    <InfoPill icon={<Clock3 size={15} />} text="10:00 AM" />
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
                time="10:00 AM"
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

          {/* GUESTBOOK */}

          <section id="guestbook" className="bg-[#fffaf8] px-6 py-28">
            <Reveal>
              <SectionHeading
                eyebrow="Leave a little love"
                title="Guestbook"
                description="Write a message for Eliora and the family."
              />
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-5xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
              <Reveal>
                <form
                  onSubmit={handleGuestbookSubmit}
                  className="rounded-[30px] border border-[#f1dce2] bg-white p-6 shadow-lg md:p-8"
                >
                  <MessageCircleHeart className="text-[#b85c7b]" size={25} />

                  <h3 className="mt-4 font-serif text-2xl text-[#8f5269]">
                    Send a message
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#a57d8c]">
                    Your message will become part of Eliora&apos;s little
                    collection of memories.
                  </p>

                  <div className="mt-7">
                    <label className="text-sm font-medium text-[#8f5269]">
                      Your name
                    </label>

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
                      placeholder="Enter your name"
                      className="mt-2 w-full rounded-xl border border-[#ead5dc] bg-[#fffafc] px-4 py-3 text-sm outline-none transition focus:border-[#c9899f] focus:ring-2 focus:ring-[#c9899f]/10"
                    />

                    {guestErrors.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {guestErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="text-sm font-medium text-[#8f5269]">
                      Your message
                    </label>

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
                      rows={5}
                      placeholder="Write something sweet..."
                      className="mt-2 w-full resize-none rounded-xl border border-[#ead5dc] bg-[#fffafc] px-4 py-3 text-sm outline-none transition focus:border-[#c9899f] focus:ring-2 focus:ring-[#c9899f]/10"
                    />

                    <div className="mt-1 flex justify-between">
                      {guestErrors.message ? (
                        <p className="text-xs text-red-500">
                          {guestErrors.message}
                        </p>
                      ) : (
                        <span />
                      )}

                      <span className="text-xs text-[#b99aa5]">
                        {guestMessage.length}/500
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isSubmittingGuestbook}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b85c7b] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a84f6d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingGuestbook ? "Sending..." : "Send Love"}

                    <Send size={16} />
                  </button>
                </form>
              </Reveal>

              <Reveal delay={0.12}>
                <div>
                  {displayedGuests.length === 0 ? (
                    <div className="flex min-h-[300px] items-center justify-center rounded-[30px] border border-dashed border-[#e4c6d1] bg-white/60 p-8 text-center">
                      <div>
                        <Heart className="mx-auto text-[#d79bae]" size={28} />

                        <p className="mt-4 font-serif text-xl text-[#8f5269]">
                          Be the first to leave some love.
                        </p>

                        <p className="mt-2 text-sm text-[#aa8592]">
                          Your message could be the first memory in
                          Eliora&apos;s guestbook.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayedGuests.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{
                            opacity: 0,
                            y: 15,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: index * 0.05,
                          }}
                          className="rounded-2xl border border-[#f0dfe4] bg-white p-5 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fce5ec] text-[#b85c7b]">
                              <Heart size={15} fill="currentColor" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-[#8f5269]">
                                  {entry.name}
                                </p>

                                {entry.createdAt && (
                                  <span className="text-[10px] text-[#b89aa6]">
                                    {formatGuestDate(entry.createdAt)}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-[#9c7b87]">
                                {entry.message}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
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

                        <p className="mt-1 text-xs text-[#a98592]">10:00 AM</p>
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
          </section>

          {/* FINAL THANK YOU */}

          <section className="relative overflow-hidden bg-[#fff5f7] px-6 py-32">
            <FloatingDecor />

            <Reveal>
              <div className="mx-auto max-w-3xl text-center">
                <motion.div
                  animate={{
                    y: [0, -6, 0],
                    rotate: [0, 3, 0, -3, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                  }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#b85c7b] shadow-lg"
                >
                  <Heart size={25} fill="currentColor" />
                </motion.div>

                <p className="mt-8 text-xs uppercase tracking-[0.4em] text-[#b9788d]">
                  With all our love
                </p>

                <h2 className="mt-5 font-serif text-5xl text-[#8f5269] md:text-6xl">
                  Thank you
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-[#9c7483]">
                  Thank you for being part of Eliora Faye&apos;s special day.
                  Your presence, prayers, and love mean so much to our family.
                </p>

                <div className="mx-auto mt-10 max-w-[220px] overflow-hidden rounded-[45%_45%_15%_15%] border-8 border-white shadow-xl">
                  <img
                    src="/eliora-faye.jpeg"
                    alt="Eliora Faye"
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>

                <p className="mt-9 font-serif text-2xl text-[#b85c7b]">
                  Eliora Faye
                </p>

                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#b08b98]">
                  & Family
                </p>
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
