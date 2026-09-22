"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Heart,
  Church,
  Shirt,
  Sparkles,
  ArrowDown,
  CheckCircle2,
  BookHeart,
  Clock4,
  MessageCircleHeart,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

const EVENT_DATE = "2026-11-22T10:00:00";
const GOOGLE_FORM_URL = "https://forms.google.com/";

const PARENTS = {
  father: "Alejandro De Guzman",
  mother: "Joyvy De Guzman",
};

const GODPARENTS = [
  "Sieder Villareal",
  "Ryan Bulot",
  "Maximiano Consul Jr.",
  "Lorenz Pascual",
  "Jasmine Chavez",
  "Dwight Yanela",
  "Jesselle Caras",
];

const MESSAGES_PER_PAGE = 3;

export default function Home() {
  const [opened, setOpened] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestMessage, setGuestMessage] = useState("");

  type GuestEntry = {
    id: string;
    name: string;
    message: string;
    createdAt: Date | null;
  };

  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitGuestMessage = async () => {
    const errors = {
      name: "",
      message: "",
    };

    if (!guestName.trim()) {
      errors.name = "Please enter your name.";
    }

    if (!guestMessage.trim()) {
      errors.message = "Please enter your message or blessing.";
    }

    setGuestErrors(errors);

    if (errors.name || errors.message) {
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

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

      setCurrentPage(1);
    } catch (error) {
      console.error("SUBMIT GUEST MESSAGE ERROR:", error);

      alert("Failed to submit your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [guestErrors, setGuestErrors] = useState({
    name: "",
    message: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(guestEntries.length / MESSAGES_PER_PAGE)
  );

  const paginatedEntries = guestEntries.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE
  );

  useEffect(() => {
    const messagesRef = collection(db, "guestMessages");

    const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages: GuestEntry[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            name: data.name ?? "",
            message: data.message ?? "",
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toDate()
                : null,
          };
        });

        setGuestEntries(messages);

        // Kapag may bagong message, balik sa first page
        setCurrentPage(1);
      },
      (error) => {
        console.error("REALTIME GUESTBOOK ERROR:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const difference = new Date(EVENT_DATE).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / 86400000),
        hours: Math.floor((difference / 3600000) % 24),
        minutes: Math.floor((difference / 60000) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf8] text-[#704653]">
      <AnimatePresence>
        {!opened && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.9 }}
            className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fff8fb,#f7dce7_70%,#edbfd1)] px-5"
          >
            <FloatingFlowers />

            <Parallax speed={80} className="left-6 top-20 text-4xl opacity-60">
              ✨
            </Parallax>

            <Parallax
              speed={120}
              className="bottom-24 right-6 text-5xl opacity-60"
            >
              🌸
            </Parallax>

            <motion.div
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="relative z-10 w-full max-w-md text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#ae7088]">
                A little blessing is on the way
              </p>

              <div className="mt-8 rounded-[2.5rem] border border-white/80 bg-white/55 p-4 shadow-2xl shadow-[#b87591]/25 backdrop-blur-xl">
                <div className="relative aspect-[1.25/1] overflow-hidden rounded-[2rem] border border-[#e8b1c4] bg-[#f2c5d5]">
                  <div
                    className="absolute inset-x-0 top-0 z-20 h-1/2 origin-top bg-[#dfa0b8] shadow-md"
                    style={{
                      clipPath: "polygon(0 0,100% 0,50% 100%)",
                    }}
                  />

                  <div className="absolute inset-5 flex items-center justify-center rounded-2xl bg-[#fffaf6] shadow-inner">
                    <div className="mt-10 px-5">
                      <p className="mt-16 font-serif text-sm italic text-[#b9788d]">
                        The Holy Baptism of
                      </p>

                      <h1 className="mt-2 font-serif text-2xl font-bold leading-tight text-[#b85c7b]">
                        Eliora Faye
                        <br />
                        De Guzman
                      </h1>

                      <div className="mx-auto mt-2 h-px w-16 bg-[#e6b1c3]" />
                    </div>
                  </div>

                  <div className="absolute bottom-[-1.4rem] left-1/2 z-30 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-8 border-[#f8dce6] bg-[#c87896] text-white shadow-xl">
                    <Heart size={25} fill="currentColor" />
                  </div>
                </div>
              </div>

              <p className="mt-12 font-serif text-xl italic text-[#a96780]">
                You are warmly invited
              </p>

              <button
                onClick={() => setOpened(true)}
                className="mt-6 rounded-full bg-[#b85c7b] px-10 py-4 text-sm font-bold text-white shadow-xl shadow-[#c87896]/30 transition hover:-translate-y-1 hover:bg-[#9f4d69]"
              >
                Open Invitation ✨
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {opened && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* HERO */}
          <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-24">
            <FloatingFlowers />

            <Parallax speed={130} className="left-5 top-32 text-5xl opacity-40">
              🌸
            </Parallax>

            <Parallax
              speed={180}
              className="right-5 top-44 text-4xl opacity-40"
            >
              ✨
            </Parallax>

            <Parallax
              speed={100}
              className="bottom-28 left-1/4 text-4xl opacity-40"
            >
              🎀
            </Parallax>

            <Reveal>
              <div className="relative z-10 mx-auto w-full max-w-3xl rounded-[3rem] border border-white/90 bg-white/75 px-6 py-14 text-center shadow-2xl shadow-[#d69aae]/20 backdrop-blur-xl sm:px-16">
                <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-[#c9899f]">
                  A day of love, faith & blessings
                </p>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="my-7 text-6xl"
                >
                  🕊️
                </motion.div>

                <p className="font-serif text-xl italic text-[#b9788d]">
                  Please join us for
                </p>

                <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-[#b85c7b] sm:text-7xl">
                  Eliora Faye
                </h1>

                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9899f]">
                  De Guzman
                </p>

                <div className="mx-auto my-8 h-px w-24 bg-[#e9b6c5]" />

                <p className="mx-auto max-w-lg leading-relaxed text-[#916b76]">
                  With grateful hearts, we invite you to celebrate the Holy
                  Baptism of our precious little angel.
                </p>

                <div className="relative mx-auto mt-10 max-w-sm">
                  <div className="absolute -inset-3 rounded-[2.5rem] border border-[#efc1d1]" />

                  <div className="relative rounded-[2.5rem] border-[10px] border-white bg-[#fce5ec] p-2 shadow-xl">
                    <img
                      src="/eliora-faye.jpeg"
                      alt="Eliora Faye"
                      className="aspect-[4/5] w-full rounded-[1.8rem] object-cover"
                    />
                  </div>
                </div>

                <p className="mt-7 font-serif text-lg italic text-[#b9788d]">
                  Our little blessing 💗
                </p>

                <a
                  href="#story"
                  className="mx-auto mt-8 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b85c7b]"
                >
                  Explore invitation
                  <ArrowDown size={15} />
                </a>
              </div>
            </Reveal>
          </section>

          {/* STORY */}
          <section id="story" className="bg-[#fff0f4] px-5 py-24">
            <Reveal>
              <SectionHeading
                eyebrow="A little story"
                title="Meet Eliora Faye"
              />

              <div className="mx-auto mt-10 max-w-2xl rounded-[2.5rem] border border-[#f3ceda] bg-white p-8 text-center shadow-xl shadow-[#eab8ca]/15 sm:p-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fce5ec] text-[#c87896]">
                  <BookHeart size={30} />
                </div>

                <p className="mt-6 font-serif text-2xl italic text-[#b9788d]">
                  Our sweetest blessing
                </p>

                <p className="mt-5 leading-relaxed text-[#916b76]">
                  Every smile, every little moment, and every new discovery
                  makes our world brighter. We are grateful to God for the gift
                  of Eliora Faye and for the love surrounding her.
                </p>

                <div className="mx-auto my-7 h-px w-20 bg-[#edc2cf]" />

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9899f]">
                  A life filled with faith, love, and joy
                </p>
              </div>
            </Reveal>
          </section>

          {/* TIMELINE */}
          <section id="timeline" className="px-5 py-24">
            <Reveal>
              <SectionHeading
                eyebrow="The celebration"
                title="Event Timeline"
              />

              <div className="mx-auto mt-10 max-w-2xl space-y-5">
                <TimelineItem
                  time="10:00 AM"
                  title="Holy Baptism"
                  text="Saint Francis of Assisi and Santa Quiteria Parish Church"
                  icon={<Church />}
                />

                <TimelineItem
                  time="Reception"
                  title="Lunch & Celebration"
                  text="Savory SM North Edsa Annex"
                  icon={<Clock4 />}
                />
              </div>
            </Reveal>
          </section>

          {/* COUNTDOWN */}
          <section className="bg-[#fce5ec] px-5 py-24 text-center">
            <Reveal>
              <SectionHeading
                eyebrow="Mark your calendar"
                title="Counting Down"
              />

              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-4 gap-2 sm:gap-5">
                <CountdownBox value={timeLeft.days} label="Days" />
                <CountdownBox value={timeLeft.hours} label="Hours" />
                <CountdownBox value={timeLeft.minutes} label="Minutes" />
                <CountdownBox value={timeLeft.seconds} label="Seconds" />
              </div>
            </Reveal>
          </section>

          {/* GALLERY */}
          <section id="gallery" className="px-5 py-24">
            <Reveal>
              <SectionHeading eyebrow="Little moments" title="Photo Gallery" />

              <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  "/eliora-faye.jpeg",
                  "/eliora-faye.jpeg",
                  "/eliora-faye.jpeg",
                  "/eliora-faye.jpeg",
                  "/eliora-faye.jpeg",
                  "/eliora-faye.jpeg",
                ].map((src, index) => (
                  <motion.div
                    key={`${src}-${index}`}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`overflow-hidden rounded-[1.5rem] border-4 border-white bg-[#fce5ec] shadow-lg ${
                      index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Eliora Faye memory ${index + 1}`}
                      className="h-full min-h-40 w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>

              <p className="mt-6 text-center text-sm italic text-[#b9788d]">
                Replace the repeated image paths with your favorite photos.
              </p>
            </Reveal>
          </section>

          {/* GODPARENTS */}
          <section className="px-5 py-24">
            <Reveal>
              <SectionHeading eyebrow="Our chosen family" title="Godparents" />

              <p className="mx-auto mt-5 max-w-md text-center leading-relaxed text-[#916b76]">
                Thank you for guiding, loving, and supporting Eliora as she
                grows.
              </p>

              <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
                {GODPARENTS.map((name, index) => (
                  <motion.div
                    key={`${name}-${index}`}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.06,
                    }}
                    whileHover={{ y: -6 }}
                    className="relative rounded-[1.8rem] border border-[#f1c4d2] bg-[#fff0f4] px-5 py-7 text-center shadow-md shadow-[#eab8ca]/15"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#d48ba2] shadow-sm">
                      <Heart size={19} fill="currentColor" />
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9899f]">
                      Godparent
                    </p>

                    <p className="mt-2 font-serif text-lg font-bold text-[#b85c7b]">
                      {name}
                    </p>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </section>

          {/* VENUES */}
          <section className="bg-[#fff0f4] px-5 py-24">
            <Reveal>
              <SectionHeading
                eyebrow="Come celebrate with us"
                title="Join Us"
              />

              <VenueCard
                icon={<Church />}
                title="Church"
                subtitle="Saint Francis of Assisi and Santa Quiteria Parish Church"
                description="Diocese of Kalookan"
                url="https://www.google.com/maps/place/Saint+Francis+of+Assisi+and+Santa+Quiteria+Parish+Church+(Diocese+of+Kalookan)/@14.6812817,121.0070118,17z"
              />

              <VenueCard
                icon={<MapPin />}
                title="Reception"
                subtitle="Savory SM North Edsa Annex"
                description="Reception venue"
                url="https://www.google.com/maps/place/Classic+Savory/@14.6567301,121.0258151,17z"
              />
            </Reveal>
          </section>

          {/* DRESS CODE */}
          <section className="px-5 py-24 text-center">
            <Reveal>
              <Shirt className="mx-auto text-[#d48ba2]" size={40} />

              <SectionHeading eyebrow="A gentle request" title="Dress Code" />

              <p className="mx-auto mt-5 max-w-md leading-relaxed text-[#916b76]">
                We invite our guests to celebrate in pastel pink and white.
              </p>

              <div className="mt-8 flex justify-center gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-white bg-[#f2b6c8] shadow-md" />
                <div className="h-16 w-16 rounded-full border-4 border-[#f1dfe5] bg-[#fffaf5] shadow-md" />
                <div className="h-16 w-16 rounded-full border-4 border-white bg-[#dba2b5] shadow-md" />
              </div>

              <p className="mt-5 font-serif italic text-[#b9788d]">
                Soft, elegant, and lovely
              </p>
            </Reveal>
          </section>

          {/* GUESTBOOK */}
          <section
            id="guestbook"
            className="relative overflow-hidden bg-[#fff0f4] px-5 py-24"
          >
            <Reveal>
              <SectionHeading
                eyebrow="A message from the heart"
                title="Guestbook"
              />

              <p className="mx-auto mt-5 max-w-md text-center leading-relaxed text-[#916b76]">
                Leave a sweet message or blessing for Eliora Faye.
              </p>

              <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-2">
                {/* FORM */}
                <div className="rounded-[2.5rem] border border-[#f3ceda] bg-white p-7 shadow-xl shadow-[#eab8ca]/15 sm:p-10">
                  <div className="flex justify-center text-[#d48ba2]">
                    <MessageCircleHeart size={38} />
                  </div>

                  <h3 className="mt-4 text-center font-serif text-2xl font-bold text-[#b85c7b]">
                    Send Your Wishes
                  </h3>

                  <p className="mt-2 text-center text-sm text-[#916b76]">
                    Share your love and blessings.
                  </p>

                  <form
                    className="mt-6 space-y-4"
                    onSubmit={(event) => {
                      event.preventDefault();

                      const errors = {
                        name: "",
                        message: "",
                      };

                      if (!guestName.trim()) {
                        errors.name = "Please enter your name.";
                      }

                      if (!guestMessage.trim()) {
                        errors.message =
                          "Please enter your message or blessing.";
                      }

                      setGuestErrors(errors);

                      if (errors.name || errors.message) {
                        return;
                      }

                      event.preventDefault();
                      handleSubmitGuestMessage();

                      // Return to the first page after adding a message
                      setCurrentPage(1);

                      setGuestName("");
                      setGuestMessage("");

                      setGuestErrors({
                        name: "",
                        message: "",
                      });
                    }}
                  >
                    {/* NAME */}
                    <div>
                      <input
                        value={guestName}
                        onChange={(event) => {
                          setGuestName(event.target.value);

                          if (event.target.value.trim()) {
                            setGuestErrors((errors) => ({
                              ...errors,
                              name: "",
                            }));
                          }
                        }}
                        placeholder="Your name"
                        aria-invalid={Boolean(guestErrors.name)}
                        className={`w-full rounded-2xl border bg-[#fffafc] px-4 py-3 text-sm outline-none focus:ring-2 ${
                          guestErrors.name
                            ? "border-red-400 focus:ring-red-300"
                            : "border-[#efd0dc] focus:ring-[#d989a3]"
                        }`}
                      />

                      {guestErrors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2 px-2 text-xs text-[#b85c7b]"
                        >
                          <span>♡</span>
                          {guestErrors.name}
                        </motion.p>
                      )}
                    </div>

                    {/* MESSAGE */}
                    <div>
                      <textarea
                        value={guestMessage}
                        onChange={(event) => {
                          setGuestMessage(event.target.value);

                          if (event.target.value.trim()) {
                            setGuestErrors((errors) => ({
                              ...errors,
                              message: "",
                            }));
                          }
                        }}
                        placeholder="Your message or blessing"
                        rows={5}
                        aria-invalid={Boolean(guestErrors.message)}
                        className={`w-full resize-none rounded-2xl border bg-[#fffafc] px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                          guestErrors.message
                            ? "border-[#d989a3] focus:ring-[#f3ceda]"
                            : "border-[#efd0dc] focus:ring-[#d989a3]"
                        }`}
                      />

                      {guestErrors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 flex items-center gap-2 px-2 text-xs text-[#b85c7b]"
                        >
                          <span>♡</span>
                          {guestErrors.message}
                        </motion.p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#b85c7b] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#9f4d69]"
                    >
                      <Heart size={17} />
                      {isSubmitting ? "Sending..." : "Add Message"}
                    </button>
                  </form>
                </div>

                {/* MESSAGE LIST */}
                <div className="rounded-[2.5rem] border border-[#f3ceda] bg-white p-7 shadow-xl shadow-[#eab8ca]/15 sm:p-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#b85c7b]">
                        Messages of Love
                      </h3>

                      <p className="mt-1 text-sm text-[#916b76]">
                        {guestEntries.length}{" "}
                        {guestEntries.length === 1 ? "message" : "messages"}
                      </p>
                    </div>

                    <div className="rounded-full bg-[#fce5ec] p-3 text-[#d48ba2]">
                      <BookHeart size={24} />
                    </div>
                  </div>

                  <div className="mt-6 max-h-[480px] space-y-4 overflow-y-auto pr-2">
                    {guestEntries.length === 0 ? (
                      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#e8c5d2] bg-[#fffafc] px-6 text-center">
                        <Heart
                          size={38}
                          strokeWidth={1.5}
                          className="text-[#d9a1b4]"
                        />

                        <h4 className="mt-4 font-serif text-xl font-bold text-[#b85c7b]">
                          No messages yet
                        </h4>

                        <p className="mt-2 text-sm leading-relaxed text-[#916b76]">
                          Be the first to leave a sweet message for Eliora Faye.
                        </p>
                      </div>
                    ) : (
                      paginatedEntries.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-3xl border border-[#f3d5df] bg-[#fffafc] p-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fce5ec] font-serif text-lg font-bold text-[#b85c7b]">
                              {entry.name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <h4 className="font-semibold text-[#b85c7b]">
                                {entry.name}
                              </h4>

                              <p className="text-xs text-[#c298a8]">
                                With love for Eliora Faye 💗
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#916b76]">
                            {entry.message}
                          </p>

                          <div className="mt-4 flex justify-end">
                            <Heart
                              size={16}
                              fill="currentColor"
                              className="text-[#d9a1b4]"
                            />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* PAGINATION */}
                  {guestEntries.length > MESSAGES_PER_PAGE && (
                    <div className="mt-6 flex items-center justify-between border-t border-[#f3d5df] pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-full border border-[#efd0dc] px-4 py-2 text-xs font-bold text-[#b85c7b] transition hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={15} />
                        Previous
                      </button>

                      <span className="text-xs font-semibold text-[#916b76]">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 rounded-full border border-[#efd0dc] px-4 py-2 text-xs font-bold text-[#b85c7b] transition hover:bg-[#fff0f4] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            <FloatingFlowers />
          </section>

          {/* RSVP */}
          <section className="bg-[#fce5ec] px-5 py-28 text-center">
            <Reveal>
              <Heart
                className="mx-auto text-[#d48ba2]"
                size={40}
                fill="currentColor"
              />

              <SectionHeading
                eyebrow="Your presence means so much"
                title="We Hope You Can Join Us!"
              />

              <p className="mx-auto mt-5 max-w-md leading-relaxed text-[#916b76]">
                Your presence will make this celebration even more meaningful.
              </p>

              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#b85c7b] px-8 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#9f4d69]"
              >
                <CheckCircle2 size={18} />
                Confirm Attendance
              </a>
            </Reveal>
          </section>

          {/* FOOTER */}
          <footer className="bg-[#fffaf8] px-5 py-16 text-center">
            <Sparkles className="mx-auto text-[#d48ba2]" size={24} />

            <p className="mt-5 font-serif text-2xl italic text-[#b9788d]">
              With love,
            </p>

            <p className="mt-3 font-serif text-xl font-bold text-[#b85c7b]">
              Eliora Faye & Family
            </p>

            <p className="mt-6 text-2xl">🌸 🕊️ 🌸</p>

            <p className="mt-6 text-xs text-[#bfa0aa]">
              A day filled with love and blessings
            </p>
          </footer>
        </motion.div>
      )}
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#c9899f]">
        {eyebrow}
      </p>

      <h2 className="mt-4 font-serif text-4xl font-bold text-[#b85c7b]">
        {title}
      </h2>

      <div className="mx-auto mt-5 h-px w-16 bg-[#e9b6c5]" />
    </div>
  );
}

function VenueCard({
  icon,
  title,
  subtitle,
  description,
  url,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  url: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="mx-auto mt-8 max-w-xl rounded-[2.2rem] border border-[#f3ceda] bg-white p-8 text-center shadow-lg shadow-[#eab8ca]/15"
    >
      <div className="flex justify-center text-[#d48ba2]">{icon}</div>

      <h3 className="mt-5 font-serif text-2xl font-bold text-[#b85c7b]">
        {title}
      </h3>

      <p className="mt-3 font-semibold text-[#916b76]">{subtitle}</p>

      <p className="mt-1 text-sm text-[#a7838c]">{description}</p>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block rounded-full bg-[#d989a3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b85c7b]"
      >
        View Location
      </a>
    </motion.div>
  );
}

function TimelineItem({
  time,
  title,
  text,
  icon,
}: {
  time: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="flex gap-4 rounded-3xl border border-[#f3ceda] bg-white p-5 shadow-sm"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fce5ec] text-[#c87896]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9899f]">
          {time}
        </p>

        <h3 className="mt-1 font-serif text-xl font-bold text-[#b85c7b]">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-relaxed text-[#916b76]">{text}</p>
      </div>
    </motion.div>
  );
}

function Parallax({
  children,
  speed = 100,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={`pointer-events-none absolute ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      className="rounded-2xl border border-[#f1c4d2] bg-white p-3 text-center shadow-sm sm:p-5"
    >
      <p className="font-serif text-2xl font-bold text-[#b85c7b] sm:text-4xl">
        {String(value).padStart(2, "0")}
      </p>

      <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-[#c9899f] sm:text-xs">
        {label}
      </p>
    </motion.div>
  );
}

function FloatingFlowers() {
  return (
    <>
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-5 top-16 text-6xl opacity-50"
      >
        🌸
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute right-5 top-28 text-6xl opacity-50"
      >
        🌷
      </motion.div>

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute bottom-20 left-10 text-4xl opacity-50"
      >
        🎀
      </motion.div>
    </>
  );
}
